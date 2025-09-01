const CACHE_NAME = 'chat-app-v3'

// 只缓存确定存在的资源
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// 安装Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        // 使用更安全的缓存策略
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn('Failed to cache:', url, err)
              return null
            })
          )
        )
      })
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.map(n => n !== CACHE_NAME && caches.delete(n)))
    await self.clients.claim()
  })())
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') {
    return
  }

  // 跳过API请求
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有响应，返回缓存的响应
        if (response) {
          return response
        }

        // 否则从网络获取
        return fetch(event.request).then(
          (response) => {
            // 检查是否收到有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // 只缓存静态资源
            const url = new URL(event.request.url)
            const isStaticResource = url.pathname.startsWith('/_next/static/') ||
                                   url.pathname.endsWith('.css') ||
                                   url.pathname.endsWith('.js') ||
                                   url.pathname.endsWith('.png') ||
                                   url.pathname.endsWith('.jpg') ||
                                   url.pathname.endsWith('.svg') ||
                                   url.pathname.endsWith('.ico')

            if (isStaticResource) {
              // 克隆响应
              const responseToCache = response.clone()

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
                .catch(err => {
                  console.warn('Failed to cache response:', err)
                })
            }

            return response
          }
        ).catch(err => {
          console.warn('Fetch failed:', err)
          // 返回一个简单的离线页面
          return new Response('离线模式', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          })
        })
      })
  )
})
