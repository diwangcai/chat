import { NextRequest, NextResponse } from 'next/server'

// 内存存储（生产环境应使用数据库）
const keyStore = new Map<string, {
  identityKey: any
  signedPreKey: any
  signedPreKeyId: string
  oneTimePreKeys: Array<{
    id: string
    publicKey: any
  }>
  lastUpdated: Date
}>()

/**
 * GET /api/keys/[userId] - 获取指定用户的密钥
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userKeys = keyStore.get(userId)

    if (!userKeys) {
      return NextResponse.json(
        { error: 'User keys not found' },
        { status: 404 }
      )
    }

    // 返回用户密钥（不包含私钥）
    const response = {
      userId,
      identityKey: userKeys.identityKey,
      signedPreKey: userKeys.signedPreKey,
      signedPreKeyId: userKeys.signedPreKeyId,
      oneTimePreKey: userKeys.oneTimePreKeys.length > 0 ? userKeys.oneTimePreKeys[0] : null,
      lastUpdated: userKeys.lastUpdated
    }

    // 如果返回了一个一次性预共享密钥，从存储中移除它
    if (response.oneTimePreKey) {
      userKeys.oneTimePreKeys.shift()
      keyStore.set(userId, userKeys)
    }

    return NextResponse.json(response)

  } catch (error) {
    const requestId = request.headers.get('x-request-id') || 'n/a'
    console.error('key_get_failed', { requestId, message: error instanceof Error ? error.message : 'Internal server error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/keys/[userId] - 删除指定用户的密钥
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const deleted = keyStore.delete(userId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'User keys not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'User keys deleted successfully'
    })

  } catch (error) {
    const requestId = request.headers.get('x-request-id') || 'n/a'
    console.error('key_delete_failed', { requestId, message: error instanceof Error ? error.message : 'Internal server error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
