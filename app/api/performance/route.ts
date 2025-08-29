import { NextRequest, NextResponse } from 'next/server'

/**
 * 性能监控API端点
 * 提供应用性能指标和监控数据
 */

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // 收集性能指标
    const performanceData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: {
        usage: process.cpuUsage()
      },
      environment: process.env.NODE_ENV,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'ok',
      data: performanceData,
      responseTime,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Performance monitoring failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric, value, timestamp } = body

    // 记录性能指标（这里可以集成到监控系统）
    console.log('Performance metric:', {
      metric,
      value,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    return NextResponse.json({
      status: 'ok',
      message: 'Performance metric recorded',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to record performance metric',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}
