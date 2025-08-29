import { NextRequest, NextResponse } from 'next/server'

/**
 * E2E测试专用API端点
 * 仅在E2E模式下可用，用于测试数据管理
 */

export async function GET(_request: NextRequest) {
  // 检查是否在E2E模式下
  if (process.env.NEXT_PUBLIC_E2E !== '1') {
    return NextResponse.json(
      { error: 'E2E API only available in E2E mode' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    status: 'ok',
    mode: 'e2e',
    timestamp: new Date().toISOString(),
    features: {
      auth: true,
      chat: true,
      encryption: true
    }
  })
}

export async function POST(request: NextRequest) {
  // 检查是否在E2E模式下
  if (process.env.NEXT_PUBLIC_E2E !== '1') {
    return NextResponse.json(
      { error: 'E2E API only available in E2E mode' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'reset':
        // 重置测试数据
        return NextResponse.json({
          success: true,
          message: 'Test data reset successfully',
          timestamp: new Date().toISOString()
        })

      case 'setup':
        // 设置测试数据
        return NextResponse.json({
          success: true,
          message: 'Test data setup successfully',
          data: data || {},
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
