'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)
  return (
    <div className="p-4">
      出错了：{error.message}
      <button className="ml-2 underline" onClick={reset}>重试</button>
    </div>
  )
}

