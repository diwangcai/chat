import { headers } from 'next/headers'

export async function origin(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const forwardedHost = h.get('x-forwarded-host')
  const host = forwardedHost ?? h.get('host') ?? ''
  return `${proto}://${host}`
}

// 用法示例（服务端）：
// new URL('/api/x', await origin())


