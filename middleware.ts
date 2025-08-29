import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// 生成高熵 nonce（每请求一份），Edge 运行时无 Buffer，使用 btoa 进行 base64
function nonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  return btoa(binary)
}

export function middleware(req: NextRequest) {
  const n = nonce()

  // 传递 nonce 给后续 App Router（作为请求头）
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', n)

  const res = NextResponse.next({ request: { headers: requestHeaders } })

  // 严格 CSP：带 nonce 的脚本 + strict-dynamic；连接放开 https/wss
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${n}' 'strict-dynamic'`,
    "connect-src 'self' https: wss:",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


