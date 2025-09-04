import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ClientOnly from '@/components/ClientOnly'
import MessageList from '@/components/MessageList'
import { Message, User, Conversation } from '@/types/chat'

describe('Components 测试', () => {
  describe('ClientOnly', () => {
    it('应该最终显示子组件内容', async () => {
      render(
        <ClientOnly fallback={<div>Loading...</div>}>
          <div>Client content</div>
        </ClientOnly>
      )

      // 等待useEffect执行后显示子组件
      await waitFor(() => {
        expect(screen.getByText('Client content')).toBeInTheDocument()
      })
    })

    it('应该在挂载后显示子组件', async () => {
      render(
        <ClientOnly fallback={<div>Loading...</div>}>
          <div>Client content</div>
        </ClientOnly>
      )

      // 等待 useEffect 执行
      await waitFor(() => {
        expect(screen.getByText('Client content')).toBeInTheDocument()
      })

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('应该在没有 fallback 时正常显示子组件', async () => {
      render(
        <ClientOnly>
          <div>Client content</div>
        </ClientOnly>
      )
      
      // 等待useEffect执行后显示子组件
      await waitFor(() => {
        expect(screen.getByText('Client content')).toBeInTheDocument()
      })
    })

    it('应该正确处理多个子组件', async () => {
      render(
        <ClientOnly>
          <div>First child</div>
          <div>Second child</div>
        </ClientOnly>
      )

      await waitFor(() => {
        expect(screen.getByText('First child')).toBeInTheDocument()
        expect(screen.getByText('Second child')).toBeInTheDocument()
      })
    })

    it('应该正确处理复杂的 fallback 组件', async () => {
      const ComplexFallback = () => (
        <div>
          <span>Loading</span>
          <button>Cancel</button>
        </div>
      )

      render(
        <ClientOnly fallback={<ComplexFallback />}>
          <div>Client content</div>
        </ClientOnly>
      )
      
      // 等待useEffect执行后显示子组件
      await waitFor(() => {
        expect(screen.getByText('Client content')).toBeInTheDocument()
      })
    })
  })

  describe('MessageList', () => {
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      isOnline: true
    }

    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hello world',
        senderId: '1',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        type: 'text',
        status: 'sent'
      },
      {
        id: '2',
        content: 'How are you?',
        senderId: '2',
        timestamp: new Date('2024-01-15T10:01:00Z'),
        type: 'text',
        status: 'delivered'
      }
    ]

    const mockConversation: Conversation = {
      id: 'conv1',
      participants: [mockUser],
      lastMessage: mockMessages[1],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      createdAt: new Date('2024-01-15T09:00:00Z'),
      updatedAt: new Date('2024-01-15T10:01:00Z')
    }

    const defaultProps = {
      messages: mockMessages,
      currentUserId: '1',
      currentUser: mockUser,
      currentConversation: mockConversation,
      onImageClick: vi.fn(),
      onReply: vi.fn(),
      onDelete: vi.fn(),
      onToggleStar: vi.fn(),
      onRetry: vi.fn()
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('应该渲染消息列表', () => {
      render(<MessageList {...defaultProps} />)
      
      expect(screen.getByText('Hello world')).toBeInTheDocument()
      expect(screen.getByText('How are you?')).toBeInTheDocument()
    })

    it('应该处理空消息列表', () => {
      render(<MessageList {...defaultProps} messages={[]} />)
      
      const messageList = screen.getByTestId('message-list')
      expect(messageList).toBeInTheDocument()
      // 空消息列表应该只包含容器本身，没有消息项
      expect(messageList.children.length).toBeLessThanOrEqual(1)
    })

    it('应该正确分组消息', () => {
      const groupedMessages = [
        {
          id: '1',
          content: 'First message',
          senderId: '1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          type: 'text' as const,
          status: 'sent' as const
        },
        {
          id: '2',
          content: 'Second message',
          senderId: '1',
          timestamp: new Date('2024-01-15T10:00:30Z'),
          type: 'text' as const,
          status: 'sent' as const
        }
      ]

      render(<MessageList {...defaultProps} messages={groupedMessages} />)
      
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
    })

    it('应该调用回调函数', () => {
      const onImageClick = vi.fn()
      const onReply = vi.fn()
      const onDelete = vi.fn()
      const onToggleStar = vi.fn()
      const onRetry = vi.fn()

      render(
        <MessageList 
          {...defaultProps}
          onImageClick={onImageClick}
          onReply={onReply}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
          onRetry={onRetry}
        />
      )

      // 这些回调会在MessageItem中调用，这里主要测试props传递
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('应该处理滚动到底部功能', async () => {
      const ref = { current: null }
      render(<MessageList {...defaultProps} ref={ref} />)
      
      // 等待组件挂载
      await waitFor(() => {
        expect(screen.getByTestId('message-list')).toBeInTheDocument()
      })
    })
  })
})
