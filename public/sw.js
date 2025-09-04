const CACHE_NAME = 'chat-app-v4'
const STATIC_CACHE = 'static-v3'
const HTML_CACHE = 'html-v2'

// 安装Service Worker
self.addEventListener('install', (event) => {
  // 不自动 skipWaiting，等待客户端确认
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Installed, waiting for skipWaiting signal')
        return Promise.resolve()
      })
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    const allowedCaches = [CACHE_NAME, STATIC_CACHE, HTML_CACHE]
    await Promise.all(names.filter(n => !allowedCaches.includes(n)).map(n => caches.delete(n)))
    await self.clients.claim()
    console.log('[SW] Activated with controlled caching strategy')
  })())
})

// 监听客户端消息
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING signal')
    self.skipWaiting()
  }
})

// 拦截网络请求 - 企业级缓存策略
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // 跳过非GET请求
  if (event.request.method !== 'GET') {
    return
  }

  // API请求：绕过缓存（避免过期数据）
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // HTML页面：网络优先策略
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(event.request)
        // 缓存新的HTML响应
        const cache = await caches.open(HTML_CACHE)
        cache.put(event.request, networkResponse.clone())
        return networkResponse
      } catch (error) {
        // 网络失败时返回缓存
        const cachedResponse = await caches.match(event.request)
        return cachedResponse || new Response('离线模式', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
      }
    })())
    return
  }

  // 静态资源：Stale-While-Revalidate策略
  const isStaticResource = url.pathname.startsWith('/_next/static/') ||
                          url.pathname.endsWith('.css') ||
                          url.pathname.endsWith('.js') ||
                          url.pathname.endsWith('.png') ||
                          url.pathname.endsWith('.jpg') ||
                          url.pathname.endsWith('.svg') ||
                          url.pathname.endsWith('.ico') ||
                          url.pathname.endsWith('.woff') ||
                          url.pathname.endsWith('.woff2')

  if (isStaticResource) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE)
      const cachedResponse = await cache.match(event.request)
      
      // 并行网络请求
      const networkResponse = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          cache.put(event.request, response.clone())
        }
        return response
      }).catch(() => null)
      
      // 返回缓存（如果有），否则等待网络
      return cachedResponse || networkResponse
    })())
  }
})
