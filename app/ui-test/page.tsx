'use client';

import { Button, Input } from '@/components/ui';

export default function UITestPage() {
  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-text">UI规范测试</h1>
        
        {/* 颜色规范测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">颜色规范</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg p-4 rounded-[12px] border">
              <div className="text-sm text-subtext">背景色 (bg)</div>
            </div>
            <div className="bg-surface p-4 rounded-[12px] border">
              <div className="text-sm text-text">表面色 (surface)</div>
            </div>
            <div className="bg-brand p-4 rounded-[12px]">
              <div className="text-sm text-white">品牌色 (brand)</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-[12px]">
              <div className="text-sm text-subtext">次要文本 (subtext)</div>
            </div>
          </div>
        </div>

        {/* 圆角规范测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">圆角规范</h2>
          <div className="space-y-2">
            <div className="bg-surface p-4 rounded-[12px] border">
              <div className="text-sm text-text">默认圆角 (12px)</div>
            </div>
            <div className="bg-surface p-4 rounded-[18px] border">
              <div className="text-sm text-text">中等圆角 (18px)</div>
            </div>
          </div>
        </div>

        {/* 间距规范测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">间距规范 (8pt基线)</h2>
          <div className="space-y-1">
            <div className="bg-surface p-1 border rounded">
              <div className="text-xs text-text">1 = 8px</div>
            </div>
            <div className="bg-surface p-2 border rounded">
              <div className="text-xs text-text">2 = 16px</div>
            </div>
            <div className="bg-surface p-4 border rounded">
              <div className="text-xs text-text">4 = 32px</div>
            </div>
          </div>
        </div>

        {/* 按钮组件测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">按钮组件</h2>
          <div className="space-y-2">
            <Button variant="primary" className="w-full">
              主要按钮
            </Button>
            <Button variant="ghost" className="w-full">
              次要按钮
            </Button>
          </div>
        </div>

        {/* 输入框组件测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">输入框组件</h2>
          <div className="space-y-2">
            <Input placeholder="请输入内容..." />
            <Input placeholder="禁用状态" disabled />
          </div>
        </div>

        {/* 焦点环测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">焦点环测试</h2>
          <div className="text-sm text-subtext">
            点击下面的元素查看焦点环效果（2px品牌色）
          </div>
          <div className="space-y-2">
            <button className="w-full p-3 bg-surface border rounded-[12px] text-left">
              可聚焦按钮
            </button>
            <input 
              className="w-full p-3 bg-surface border rounded-[18px]"
              placeholder="可聚焦输入框"
            />
          </div>
        </div>

        {/* 移动端安全区测试 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">移动端安全区</h2>
          <div className="text-sm text-subtext">
            在移动设备上查看底部安全区域效果
          </div>
          <div className="bg-brand text-white p-4 rounded-[12px] text-center">
            底部安全区域测试
          </div>
        </div>
      </div>
    </div>
  );
}
