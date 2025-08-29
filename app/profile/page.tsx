"use client"

export default function ProfilePage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">个人中心</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <div className="text-sm text-gray-700">昵称</div>
          <input className="w-full mt-2 p-2 border rounded" placeholder="输入昵称" />
        </div>
        <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <div className="text-sm text-gray-700">个性签名</div>
          <textarea className="w-full mt-2 p-2 border rounded" placeholder="一句话介绍你自己" />
        </div>
        <button className="btn-primary">保存</button>
      </div>
    </div>
  )
}
