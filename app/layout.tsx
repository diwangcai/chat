import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@/lib/axe-setup'
import '@/features/ui-rescue/styles/index.css'

export const metadata: Metadata = {
  title: '聊天应用',
  description: '现代化的聊天应用',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(e) {
                var msg = (e && e.reason && (e.reason.message || e.reason)) + ''
                if (msg && (msg.includes('Loading chunk') || msg.includes('ChunkLoadError'))) {
                  console.warn('[runtime] chunk load failed, force refresh')
                  var base = location.pathname + location.search
                  location.href = base + (base.includes('?') ? '&' : '?') + 'v=' + Date.now()
                }
              });
              (function(){
                var isProd = '${process.env.NODE_ENV}' === 'production';
                var enableSW = ${process.env.NEXT_PUBLIC_ENABLE_SW ?? 'true'};
                if ('serviceWorker' in navigator) {
                  if (isProd && enableSW) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .then(function(registration) {
                          console.log('[SW] registered:', registration.scope);
                          // 监听 SW 更新
                          registration.addEventListener('updatefound', function() {
                            var newWorker = registration.installing;
                            if (newWorker) {
                              newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                  if (confirm('检测到新版本，是否立即更新？')) {
                                    newWorker.postMessage('SKIP_WAITING');
                                  }
                                }
                              });
                            }
                          });
                        })
                        .catch(function(err) {
                          console.warn('[SW] register failed:', err);
                        });
                    });
                    // 监听 SW 控制器变更（新版本激活）
                    navigator.serviceWorker.addEventListener('controllerchange', function() {
                      console.log('[SW] controller changed, reloading...');
                      window.location.reload();
                    });
                  } else {
                    // Dev 环境：自动注销已存在 SW 且清理缓存，避免缓存干扰
                    navigator.serviceWorker.getRegistrations()
                      .then(function(regs){ regs.forEach(function(r){ r.unregister(); }); })
                      .catch(function(){});
                    if (window.caches && window.caches.keys) {
                      window.caches.keys().then(function(keys){ keys.forEach(function(k){ window.caches.delete(k); }); });
                    }
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className="safe-area antialiased bg-bg text-text" style={{colorScheme: 'light'}}>
        {children}
      </body>
    </html>
  )
}
