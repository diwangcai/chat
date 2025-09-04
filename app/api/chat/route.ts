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
  // 企业级可观测性：TraceId与结构化日志（env开关控制）
  const traceId = req.headers.get('x-request-id') || 
    (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36)}`)
  const enableLogging = process.env.LOG_STRUCTURED === '1'
  const sampleRate = Number(process.env.LOG_SAMPLE_RATE || 0)
  const shouldLog = enableLogging && Math.random() < sampleRate
  
  const log = (event: Record<string, unknown>) => {
    if (shouldLog) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        traceId,
        service: 'chat-api',
        ...event
      }))
    }
  }

  try {
    log({ event: 'request_received', method: 'POST', path: '/api/chat' })
    if (process.env.FAKE_AI === '1') {
      const { messages } = await req.json() as ChatRequest
      const last = [...(messages || [])].reverse().find((m: ChatMessage) => m?.role === 'user')?.content ?? ''
      log({ event: 'fake_ai_response', contentLength: String(last).length })
      return NextResponse.json({ content: `【AI复读】${String(last).slice(0, 200)}` } as ChatResponse, {
        headers: { 'X-Request-Id': traceId }
      })
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
    
    log({ event: 'upstream_request_start', model, userTextLength: userText.length })

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
    }

    // 超时与失败重试（受环境变量控制，零影响默认关闭）
    const timeoutMs = Number(process.env.CHAT_API_TIMEOUT_MS || 0)
    const controller = timeoutMs > 0 ? new AbortController() : undefined
    const timer = timeoutMs > 0 ? setTimeout(() => controller?.abort(), timeoutMs) : undefined

    const doFetch = async () => fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller?.signal,
    })

    let resp = await doFetch()
    log({ event: 'upstream_response', status: resp.status, ok: resp.ok })
    
    if (!resp.ok && process.env.CHAT_API_RETRY === '1') {
      log({ event: 'retry_attempt' })
      // 简单一次重试
      resp = await doFetch()
      log({ event: 'retry_response', status: resp.status, ok: resp.ok })
    }
    if (timer) clearTimeout(timer)

    if (!resp.ok) {
      const text = await resp.text()
      log({ event: 'upstream_error', status: resp.status, errorText: text.slice(0, 200) })
      if (process.env.CHAT_API_FALLBACK === '1') {
        log({ event: 'fallback_triggered', reason: 'upstream_error' })
        return NextResponse.json({ content: `【回退】${userText.slice(0, 200)}` } as ChatResponse, {
          headers: { 'X-Request-Id': traceId }
        })
      }
      return NextResponse.json({ error: `Gemini 请求失败: ${resp.status} ${text.slice(0, 500)}` } as ChatResponse, { 
        status: 502,
        headers: { 'X-Request-Id': traceId }
      })
    }

    const data = (await resp.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    log({ event: 'upstream_success', contentLength: content.length, hasContent: !!content })
    
    // 回退逻辑：若空内容且允许回退，使用简要回显
    if (!content && process.env.CHAT_API_FALLBACK === '1') {
      log({ event: 'fallback_triggered', reason: 'empty_content' })
      return NextResponse.json({ content: `【回退】${userText.slice(0, 200)}` } as ChatResponse, {
        headers: { 'X-Request-Id': traceId }
      })
    }
    log({ event: 'response_sent', success: true })
    return NextResponse.json({ content } as ChatResponse, {
      headers: { 'X-Request-Id': traceId }
    })
  } catch (error) {
    log({ event: 'request_error', error: (error as Error).message, stack: (error as Error).stack?.slice(0, 500) })
    // 失败回退（例如超时/中断）
    if (process.env.CHAT_API_FALLBACK === '1') {
      try {
        const { messages } = await req.json() as ChatRequest
        const last = [...(messages || [])].reverse().find((m: ChatMessage) => m?.role === 'user')?.content ?? ''
        log({ event: 'fallback_triggered', reason: 'exception' })
        return NextResponse.json({ content: `【回退】${String(last).slice(0, 200)}` } as ChatResponse, {
          headers: { 'X-Request-Id': traceId }
        })
      } catch {}
    }
    return NextResponse.json({ error: (error as Error).message || 'unknown error' } as ChatResponse, { 
      status: 400,
      headers: { 'X-Request-Id': traceId }
    })
  }
}


