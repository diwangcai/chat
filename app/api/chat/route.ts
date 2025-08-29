import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
}

interface ChatResponse {
  content: string
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.FAKE_AI === '1') {
      const { messages } = await req.json() as ChatRequest
      const last = [...(messages || [])].reverse().find((m: ChatMessage) => m?.role === 'user')?.content ?? ''
      return NextResponse.json({ content: `【AI复读】${String(last).slice(0, 200)}` } as ChatResponse)
    }
    // 真模型：调用 Gemini
    const { messages } = await req.json() as ChatRequest
    const lastUser = [...(messages || [])].reverse().find((m: ChatMessage) => m?.role === 'user') as ChatMessage | undefined
    const userText = String(lastUser?.content ?? '').slice(0, 8000)
    if (!userText) {
      return NextResponse.json({ content: '' } as ChatResponse)
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY 未配置' } as ChatResponse, { status: 500 })
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Gemini 请求失败: ${resp.status} ${text.slice(0, 500)}` } as ChatResponse, { status: 502 })
    }

    const data = (await resp.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return NextResponse.json({ content } as ChatResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'unknown error' } as ChatResponse, { status: 400 })
  }
}


