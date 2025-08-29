"use client"

export default function ContactsPage() {
  const contacts = [
    { id: '2', name: '张三', online: true },
    { id: '3', name: '产品组', online: false },
  ]
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">联系人</h1>
      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                {c.name[0]}
              </div>
              <div>
                <div className="text-sm text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-500">{c.online ? '在线' : '离线'}</div>
              </div>
            </div>
            <button className="btn-primary">发起聊天</button>
          </div>
        ))}
      </div>
    </div>
  )
}
