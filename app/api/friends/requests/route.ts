import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetId } = body

    if (!targetId) {
      return NextResponse.json(
        { error: '缺少目标用户ID' },
        { status: 400 }
      )
    }

    // 模拟添加好友请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟随机成功/失败
    const success = Math.random() > 0.2 // 80% 成功率

    if (success) {
      return NextResponse.json({
        success: true,
        message: '好友请求已发送'
      })
    } else {
      return NextResponse.json(
        { error: '添加好友失败，请稍后重试' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
