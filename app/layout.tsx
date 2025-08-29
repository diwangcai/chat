import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '极简聊天室 - Minimalist Chat',
  description: '一个简洁、高效、流畅的现代聊天应用',
  keywords: ['聊天', '即时通讯', '简约设计', '流畅体验'],
  authors: [{ name: 'Minimalist Chat Team' }],
  creator: 'Minimalist Chat',
  publisher: 'Minimalist Chat',
  robots: 'index, follow',
  openGraph: {
    title: '极简聊天室',
    description: '简洁、高效、流畅的现代聊天应用',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '极简聊天室',
    description: '简洁、高效、流畅的现代聊天应用',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '极简聊天室',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#007AFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A84FF' },
  ],
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hdrs = await headers()
  const nonce = hdrs.get('x-nonce') ?? undefined
  return (
    <html lang="zh-CN">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <Script id="pre-init" nonce={nonce} strategy="beforeInteractive">
          {`window.__APP__ = window.__APP__ || {};`}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
