/**
 * E2EE 存储模块
 * 使用 IndexedDB 安全存储密钥和会话信息
 */

export interface IdentityKey {
  privateKey: JsonWebKey
  publicKey: JsonWebKey
  fingerprint: string
  createdAt: Date
}

export interface PreKey {
  id: string
  privateKey: JsonWebKey
  publicKey: JsonWebKey
  createdAt: Date
  used: boolean
}

export interface Session {
  peerUserId: string
  rootKey: string // base64 encoded
  sendCounter: number
  recvCounter: number
  peerIdentityKey: JsonWebKey
  peerSignedPreKey: JsonWebKey
  usedPreKeyId?: string
  establishedAt: Date
  lastUsedAt: Date
}

export interface TrustedPeer {
  userId: string
  fingerprint: string
  trustedAt: Date
  lastVerifiedAt?: Date
}

class E2EEStorage {
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'E2EEChatDB'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 身份密钥存储
        if (!db.objectStoreNames.contains('identity')) {
          const identityStore = db.createObjectStore('identity', { keyPath: 'id' })
          identityStore.createIndex('fingerprint', 'fingerprint', { unique: true })
        }

        // 预共享密钥存储
        if (!db.objectStoreNames.contains('prekeys')) {
          const prekeysStore = db.createObjectStore('prekeys', { keyPath: 'id' })
          prekeysStore.createIndex('used', 'used', { unique: false })
          prekeysStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // 会话存储
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'peerUserId' })
          sessionsStore.createIndex('lastUsedAt', 'lastUsedAt', { unique: false })
        }

        // 可信对等方存储
        if (!db.objectStoreNames.contains('trustedPeers')) {
          const trustedStore = db.createObjectStore('trustedPeers', { keyPath: 'userId' })
          trustedStore.createIndex('fingerprint', 'fingerprint', { unique: true })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  // 身份密钥管理
  async saveIdentityKey(identityKey: IdentityKey): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['identity'], 'readwrite')
      const store = transaction.objectStore('identity')
      const request = store.put({ id: 'current', ...identityKey })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getIdentityKey(): Promise<IdentityKey | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['identity'], 'readonly')
      const store = transaction.objectStore('identity')
      const request = store.get('current')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  // 预共享密钥管理
  async savePreKey(preKey: PreKey): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['prekeys'], 'readwrite')
      const store = transaction.objectStore('prekeys')
      const request = store.put(preKey)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getUnusedPreKey(): Promise<PreKey | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['prekeys'], 'readonly')
      const store = transaction.objectStore('prekeys')
      const index = store.index('used')
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const list: PreKey[] = (request.result || []) as PreKey[]
        const firstUnused = list.find(pk => !pk.used) || null
        resolve(firstUnused)
      }
    })
  }

  async markPreKeyAsUsed(id: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['prekeys'], 'readwrite')
      const store = transaction.objectStore('prekeys')
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const preKey = getRequest.result
        if (preKey) {
          preKey.used = true
          const putRequest = store.put(preKey)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          reject(new Error('PreKey not found'))
        }
      }
    })
  }

  async getPreKeys(count: number = 100): Promise<PreKey[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['prekeys'], 'readonly')
      const store = transaction.objectStore('prekeys')
      const index = store.index('used')
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const all: PreKey[] = (request.result || []) as PreKey[]
        const unused = all.filter(pk => !pk.used).slice(0, count)
        resolve(unused)
      }
    })
  }

  // 会话管理
  async saveSession(session: Session): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite')
      const store = transaction.objectStore('sessions')
      const request = store.put(session)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getSession(peerUserId: string): Promise<Session | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly')
      const store = transaction.objectStore('sessions')
      const request = store.get(peerUserId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async updateSession(peerUserId: string, updates: Partial<Session>): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite')
      const store = transaction.objectStore('sessions')
      const getRequest = store.get(peerUserId)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const session = getRequest.result
        if (session) {
          const updatedSession = { ...session, ...updates, lastUsedAt: new Date() }
          const putRequest = store.put(updatedSession)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          reject(new Error('Session not found'))
        }
      }
    })
  }

  async updateSessionWithRootKey(peerUserId: string, sendCounter?: number, recvCounter?: number, rootKey?: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite')
      const store = transaction.objectStore('sessions')
      const getRequest = store.get(peerUserId)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const session = getRequest.result
        if (session) {
          const updates: Partial<Session> = { lastUsedAt: new Date() }
          if (sendCounter !== undefined) updates.sendCounter = sendCounter
          if (recvCounter !== undefined) updates.recvCounter = recvCounter
          if (rootKey !== undefined) updates.rootKey = rootKey
          
          const updatedSession = { ...session, ...updates }
          const putRequest = store.put(updatedSession)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          reject(new Error('Session not found'))
        }
      }
    })
  }

  async getAllSessions(): Promise<Session[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly')
      const store = transaction.objectStore('sessions')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  // 可信对等方管理
  async saveTrustedPeer(trustedPeer: TrustedPeer): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['trustedPeers'], 'readwrite')
      const store = transaction.objectStore('trustedPeers')
      const request = store.put(trustedPeer)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getTrustedPeer(userId: string): Promise<TrustedPeer | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['trustedPeers'], 'readonly')
      const store = transaction.objectStore('trustedPeers')
      const request = store.get(userId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async updateTrustedPeerVerification(userId: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['trustedPeers'], 'readwrite')
      const store = transaction.objectStore('trustedPeers')
      const getRequest = store.get(userId)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const trustedPeer = getRequest.result
        if (trustedPeer) {
          trustedPeer.lastVerifiedAt = new Date()
          const putRequest = store.put(trustedPeer)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          reject(new Error('TrustedPeer not found'))
        }
      }
    })
  }

  // 清理过期数据
  async cleanupExpiredPreKeys(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['prekeys'], 'readwrite')
      const store = transaction.objectStore('prekeys')
      const index = store.index('createdAt')
      const cutoff = new Date(Date.now() - maxAge)
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  // 数据库重置（用于测试或重置）
  async clearAll(): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        ['identity', 'prekeys', 'sessions', 'trustedPeers'],
        'readwrite'
      )

      const stores = ['identity', 'prekeys', 'sessions', 'trustedPeers']
      let completed = 0

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          completed++
          if (completed === stores.length) {
            resolve()
          }
        }
      })
    })
  }
}

// 导出单例实例
export const e2eeStorage = new E2EEStorage()

// 兼容性检查
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

// 降级到 localStorage（仅用于开发/测试）
export class FallbackStorage {
  private readonly PREFIX = 'e2ee_'

  async saveIdentityKey(identityKey: IdentityKey): Promise<void> {
    localStorage.setItem(this.PREFIX + 'identity', JSON.stringify(identityKey))
  }

  async getIdentityKey(): Promise<IdentityKey | null> {
    const data = localStorage.getItem(this.PREFIX + 'identity')
    return data ? JSON.parse(data) : null
  }

  async saveSession(session: Session): Promise<void> {
    localStorage.setItem(this.PREFIX + `session_${session.peerUserId}`, JSON.stringify(session))
  }

  async getSession(peerUserId: string): Promise<Session | null> {
    const data = localStorage.getItem(this.PREFIX + `session_${peerUserId}`)
    if (!data) return null
    const parsed = JSON.parse(data) as Session
    // Normalize dates
    parsed.establishedAt = new Date(parsed.establishedAt)
    parsed.lastUsedAt = new Date(parsed.lastUsedAt)
    return parsed
  }

  async saveTrustedPeer(trustedPeer: TrustedPeer): Promise<void> {
    localStorage.setItem(this.PREFIX + `trusted_${trustedPeer.userId}`, JSON.stringify(trustedPeer))
  }

  async getTrustedPeer(userId: string): Promise<TrustedPeer | null> {
    const data = localStorage.getItem(this.PREFIX + `trusted_${userId}`)
    if (!data) return null
    const parsed = JSON.parse(data) as TrustedPeer
    parsed.trustedAt = new Date(parsed.trustedAt)
    if (parsed.lastVerifiedAt) parsed.lastVerifiedAt = new Date(parsed.lastVerifiedAt)
    return parsed
  }

  // PreKey management (localStorage-based)
  async savePreKey(preKey: PreKey): Promise<void> {
    localStorage.setItem(this.PREFIX + `prekey_${preKey.id}`, JSON.stringify(preKey))
  }

  async getUnusedPreKey(): Promise<PreKey | null> {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith(this.PREFIX + 'prekey_')) {
        const item = localStorage.getItem(key)
        if (!item) continue
        const preKey = JSON.parse(item) as PreKey
        if (!preKey.used) return preKey
      }
    }
    return null
  }

  async markPreKeyAsUsed(id: string): Promise<void> {
    const key = this.PREFIX + `prekey_${id}`
    const item = localStorage.getItem(key)
    if (!item) throw new Error('PreKey not found')
    const preKey = JSON.parse(item) as PreKey
    preKey.used = true
    localStorage.setItem(key, JSON.stringify(preKey))
  }

  async getPreKeys(count: number = 100): Promise<PreKey[]> {
    const keys = Object.keys(localStorage)
    const result: PreKey[] = []
    for (const key of keys) {
      if (key.startsWith(this.PREFIX + 'prekey_')) {
        const item = localStorage.getItem(key)
        if (!item) continue
        const preKey = JSON.parse(item) as PreKey
        result.push(preKey)
        if (result.length >= count) break
      }
    }
    // Order by createdAt ascending (optional)
    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    return result
  }

  // Session update helpers
  async updateSession(peerUserId: string, updates: Partial<Session>): Promise<void> {
    const existing = await this.getSession(peerUserId)
    if (!existing) throw new Error('Session not found')
    const updated: Session = {
      ...existing,
      ...updates,
      lastUsedAt: new Date()
    }
    localStorage.setItem(this.PREFIX + `session_${peerUserId}`, JSON.stringify(updated))
  }

  async updateSessionWithRootKey(peerUserId: string, sendCounter?: number, recvCounter?: number, rootKey?: string): Promise<void> {
    const existing = await this.getSession(peerUserId)
    if (!existing) throw new Error('Session not found')
    const updates: Partial<Session> = { lastUsedAt: new Date() as any }
    if (sendCounter !== undefined) updates.sendCounter = sendCounter
    if (recvCounter !== undefined) updates.recvCounter = recvCounter
    if (rootKey !== undefined) updates.rootKey = rootKey
    const updated: Session = { ...existing, ...updates }
    localStorage.setItem(this.PREFIX + `session_${peerUserId}`, JSON.stringify(updated))
  }

  async getAllSessions(): Promise<Session[]> {
    const keys = Object.keys(localStorage)
    const sessions: Session[] = []
    for (const key of keys) {
      if (key.startsWith(this.PREFIX + 'session_')) {
        const item = localStorage.getItem(key)
        if (!item) continue
        const parsed = JSON.parse(item) as Session
        parsed.establishedAt = new Date(parsed.establishedAt)
        parsed.lastUsedAt = new Date(parsed.lastUsedAt)
        sessions.push(parsed)
      }
    }
    return sessions
  }

  async updateTrustedPeerVerification(userId: string): Promise<void> {
    const existing = await this.getTrustedPeer(userId)
    if (!existing) throw new Error('TrustedPeer not found')
    existing.lastVerifiedAt = new Date()
    await this.saveTrustedPeer(existing)
  }
}

export const fallbackStorage = new FallbackStorage()
