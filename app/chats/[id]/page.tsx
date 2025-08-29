"use client"

import { useMemo } from 'react'
import ChatPage from '@/app/page'

export default function ChatByIdPage() {
  // 为简化演示，暂时复用 ChatPage（真实场景应根据 params.id 拉取数据）
  return <ChatPage />
}
