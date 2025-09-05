/**
 * E2EE 加密核心模块
 * 基于 WebCrypto API 实现 X3DH-lite 协议
 */

// 工具函数 - 安全版本，避免对象注入
export function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  if (!buffer || typeof buffer.byteLength !== 'number') {
    throw new Error('Invalid buffer');
  }
  
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof base64 !== 'string') {
    throw new Error('Invalid base64 string');
  }
  
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      const charCode = binaryString.charCodeAt(i);
      bytes[i] = charCode;
    }
    return bytes.buffer;
  } catch (error) {
    throw new Error('Invalid base64 format');
  }
}

export function concatArrayBuffers(...buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  }
  return result.buffer
}

export function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return array
}

// 密钥生成
export async function generateIdentityKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  )
}

export async function generatePreKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  )
}

// 密钥导出/导入
export async function exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey('jwk', key)
}

export async function exportPrivateKey(key: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey('jwk', key)
}

export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    []
  )
}

export async function importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  )
}

// ECDH 密钥协商
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  return await crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: publicKey
    },
    privateKey,
    256
  )
}

// HKDF 密钥派生
export async function hkdf(
  inputKeyMaterial: ArrayBuffer,
  salt: ArrayBuffer,
  info: string,
  outputLength: number = 32
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    inputKeyMaterial,
    'HKDF',
    false,
    ['deriveBits']
  )
  
  return await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: new TextEncoder().encode(info)
    },
    key,
    outputLength * 8
  )
}

// AES-GCM 加密/解密
export async function aesGcmEncrypt(
  key: ArrayBuffer,
  plaintext: Uint8Array,
  iv: Uint8Array,
  additionalData?: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const ivView = new Uint8Array(iv)
  const ptView = new Uint8Array(plaintext)
  const adView = additionalData ? new Uint8Array(additionalData) : undefined

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivView,
      additionalData: adView
    },
    cryptoKey,
    ptView
  )
  
  return new Uint8Array(ciphertext)
}

export async function aesGcmDecrypt(
  key: ArrayBuffer,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  additionalData?: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const ivView = new Uint8Array(iv)
  const ctView = new Uint8Array(ciphertext)
  const adView = additionalData ? new Uint8Array(additionalData) : undefined

  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivView,
      additionalData: adView
    },
    cryptoKey,
    ctView
  )
  
  return new Uint8Array(plaintext)
}

// 密钥指纹计算
export async function calculateFingerprint(publicKey: CryptoKey): Promise<string> {
  const exported = await exportPublicKey(publicKey)
  const keyData = new TextEncoder().encode(JSON.stringify(exported))
  const hash = await crypto.subtle.digest('SHA-256', keyData)
  return arrayBufferToBase64(hash).slice(0, 16) // 取前16字符作为指纹
}

// 消息密钥派生
export async function deriveMessageKey(
  rootKey: ArrayBuffer,
  counter: number,
  purpose: 'encrypt' | 'decrypt' = 'encrypt'
): Promise<ArrayBuffer> {
  const info = `message-${purpose}-${counter}`
  return await hkdf(rootKey, new ArrayBuffer(0), info, 32)
}

// 媒体密钥派生
export async function deriveMediaKey(
  rootKey: ArrayBuffer,
  counter: number
): Promise<ArrayBuffer> {
  return await hkdf(rootKey, new ArrayBuffer(0), `media-${counter}`, 32)
}
