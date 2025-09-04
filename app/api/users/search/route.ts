import { NextRequest, NextResponse } from 'next/server'

// 模拟用户数据
const mockUsers = [
  { id: '1', name: '张三', handle: 'zhangsan', avatar: '/avatars/avatar-2.png', status: 'online', type: 'user' },
  { id: '2', name: '李四', handle: 'lisi', avatar: '/avatars/avatar-3.png', status: 'offline', type: 'user' },
  { id: '3', name: '王五', handle: 'wangwu', avatar: '/avatars/avatar-4.png', status: 'online', type: 'user' },
  { id: '4', name: '赵六', handle: 'zhaoliu', avatar: '/avatars/avatar-5.png', status: 'last_seen', type: 'user' },
  { id: '5', name: '技术交流群', handle: 'tech_group', avatar: '/avatars/group-1.png', status: 'online', type: 'group' },
  { id: '6', name: '产品讨论频道', handle: 'product_channel', avatar: '/avatars/channel-1.png', status: 'online', type: 'channel' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const cursor = searchParams.get('cursor') || '0'
  
  if (!query.trim()) {
    return NextResponse.json({
      results: [],
      hasMore: false,
      nextCursor: null
    })
  }

  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  // 过滤结果
  const filteredResults = mockUsers.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.handle.toLowerCase().includes(query.toLowerCase())
  )

  // 分页逻辑
  const pageSize = 10
  const startIndex = parseInt(cursor)
  const endIndex = startIndex + pageSize
  const paginatedResults = filteredResults.slice(startIndex, endIndex)

  return NextResponse.json({
    results: paginatedResults,
    hasMore: endIndex < filteredResults.length,
    nextCursor: endIndex < filteredResults.length ? endIndex.toString() : null
  })
}
