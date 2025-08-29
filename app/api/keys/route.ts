import { NextRequest, NextResponse } from 'next/server'

interface IdentityKey {
  kty: string
  crv: string
  x: string
  y: string
  d?: string
}

interface PreKey {
  id: string
  publicKey: IdentityKey
}

interface UserKeys {
  identityKey: IdentityKey
  signedPreKey: IdentityKey
  signedPreKeyId: string
  oneTimePreKeys: PreKey[]
  lastUpdated: Date
}

// 内存存储（生产环境应使用数据库）
const keyStore = new Map<string, UserKeys>()

/**
 * POST /api/keys - 上传用户密钥
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, identityKey, signedPreKey, signedPreKeyId, oneTimePreKeys } = body

    if (!userId || !identityKey || !signedPreKey || !signedPreKeyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证密钥格式
    if (!identityKey.kty || !identityKey.crv || !identityKey.x || !identityKey.y) {
      return NextResponse.json(
        { error: 'Invalid identity key format' },
        { status: 400 }
      )
    }

    if (!signedPreKey.kty || !signedPreKey.crv || !signedPreKey.x || !signedPreKey.y) {
      return NextResponse.json(
        { error: 'Invalid signed pre-key format' },
        { status: 400 }
      )
    }

    // 存储密钥
    keyStore.set(userId, {
      identityKey,
      signedPreKey,
      signedPreKeyId,
      oneTimePreKeys: oneTimePreKeys || [],
      lastUpdated: new Date()
    })

    return NextResponse.json({ 
      success: true,
      message: 'Keys uploaded successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const requestId = request.headers.get('x-request-id') || 'n/a'
    console.error('keys_upload_failed', { requestId, message: error instanceof Error ? error.message : 'Internal server error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/keys - 获取所有用户密钥（仅用于调试）
 */
export async function GET(request: NextRequest) {
  try {
    const keys = Array.from(keyStore.entries()).map(([userId, data]) => ({
      userId,
      hasIdentityKey: !!data.identityKey,
      hasSignedPreKey: !!data.signedPreKey,
      oneTimePreKeyCount: data.oneTimePreKeys.length,
      lastUpdated: data.lastUpdated
    }))

    return NextResponse.json({ keys })
  } catch (error) {
    const requestId = request.headers.get('x-request-id') || 'n/a'
    console.error('keys_list_failed', { requestId, message: error instanceof Error ? error.message : 'Internal server error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
