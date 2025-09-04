import { useCallback, useRef } from 'react'

interface AbortableFetchOptions extends RequestInit {
  timeout?: number
}

interface AbortableFetchResult<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  abort: () => void
}

/**
 * 可中断的 Fetch Hook
 * @param url 请求 URL
 * @param options 请求选项
 * @returns 请求状态和控制函数
 */
export function useAbortableFetch<T = any>(
  url: string,
  options: AbortableFetchOptions = {}
): AbortableFetchResult<T> {
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const fetchWithAbort = useCallback(async (): Promise<AbortableFetchResult<T>> => {
    // 取消之前的请求
    abort()

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController()
    
    const { timeout = 10000, ...fetchOptions } = options
    
    try {
      // 设置超时
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          abortControllerRef.current?.abort()
        }, timeout)
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        data,
        loading: false,
        error: null,
        abort
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          loading: false,
          error: null,
          abort
        }
      }
      
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : '请求失败',
        abort
      }
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [url, options, abort])

  return {
    data: null,
    loading: true,
    error: null,
    abort,
    fetch: fetchWithAbort
  } as AbortableFetchResult<T> & { fetch: () => Promise<AbortableFetchResult<T>> }
}
