# Telegram UI Rescue

完全隔离的 UI 组件系统，使用 `tg-` 前缀避免样式污染。

## 🎯 目标

- **样式隔离**: 使用 `tg-` 前缀完全隔离样式，不影响现有页面
- **统一设计**: 提供一致的输入框、按钮、弹窗组件
- **可访问性**: 完整的 WCAG 2.1 AA 标准支持
- **移动端优化**: 支持安全区和动态视口高度

## 📦 组件

### TgInput - 输入框组件

```tsx
import { TgInput } from '@/features/ui-rescue'

<TgInput
  label="用户名"
  placeholder="请输入用户名"
  value={value}
  onChange={setValue}
  error={hasError}
  errorMessage="用户名不能为空"
  helpText="用户名长度应在3-20个字符之间"
/>
```

**特性:**

- ✅ 多种尺寸 (sm, md, lg)
- ✅ 错误状态和消息
- ✅ 帮助文本
- ✅ 左侧/右侧图标支持
- ✅ 完整的可访问性支持
- ✅ 键盘导航

### TgButton - 按钮组件

```tsx
import { TgButton } from '@/features/ui-rescue'

<TgButton
  variant="primary"
  size="md"
  loading={isLoading}
  onClick={handleClick}
>
  点击我
</TgButton>
```

**特性:**

- ✅ 多种变体 (primary, secondary, outline, ghost, danger)
- ✅ 多种尺寸 (sm, md, lg)
- ✅ 加载状态
- ✅ 禁用状态
- ✅ 全宽支持
- ✅ 图标支持
- ✅ 完整的可访问性支持

### TgModal - 模态框组件

```tsx
import { TgModal } from '@/features/ui-rescue'

<TgModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="确认操作"
  description="您确定要执行此操作吗？"
>
  <p>模态框内容</p>
</TgModal>
```

**特性:**

- ✅ 焦点管理
- ✅ ESC 键关闭
- ✅ 背景点击关闭
- ✅ 完整的可访问性支持
- ✅ 移动端优化

## 🎨 样式系统

### CSS 变量

所有组件使用 `--tg-*` 前缀的 CSS 变量：

```css
:root {
  --tg-bg-primary: #ffffff;
  --tg-text-primary: #111827;
  --tg-brand-primary: #0a84ff;
  --tg-border-primary: #e5e7eb;
  --tg-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  /* ... 更多变量 */
}
```

### 暗色模式支持

```css
@media (prefers-color-scheme: dark) {
  :root {
    --tg-bg-primary: #1f2937;
    --tg-text-primary: #f9fafb;
    /* ... 暗色模式变量 */
  }
}
```

### 移动端优化

- ✅ 安全区支持 (`env(safe-area-inset-*)`)
- ✅ 动态视口高度 (`100dvh`)
- ✅ 触摸优化
- ✅ 防止双击缩放

## 🔧 安装和配置

### 1. 导入样式

在 `app/layout.tsx` 中导入样式：

```tsx
import '@/features/ui-rescue/styles/index.css'
```

### 2. 使用组件

```tsx
import { TgInput, TgButton, TgModal } from '@/features/ui-rescue'

export default function MyPage() {
  return (
    <div>
      <TgInput placeholder="输入内容" />
      <TgButton variant="primary">按钮</TgButton>
    </div>
  )
}
```

## 🧪 测试

### 可访问性测试

```bash
# 运行 Telegram UI Rescue 可访问性测试
npm run test:ui-rescue
```

### 手动测试

访问 `/features/ui-rescue/demo` 查看组件演示和隔离验证。

## 📋 可访问性特性

### WCAG 2.1 AA 合规

- ✅ **对比度**: 所有文本与背景对比度 ≥ 4.5:1
- ✅ **键盘导航**: 完整的 Tab 键导航支持
- ✅ **焦点管理**: 清晰的焦点指示器
- ✅ **屏幕阅读器**: 完整的 ARIA 支持
- ✅ **语义化**: 正确的 HTML 语义

### 测试覆盖

- ✅ 颜色对比度测试
- ✅ 键盘导航测试
- ✅ 屏幕阅读器测试
- ✅ 焦点管理测试

## 🔄 回滚计划

如果需要回滚到原始状态：

1. **删除 features/ui-rescue 目录**
2. **恢复 tailwind.config.cjs**:

   ```js
   // 移除 prefix: 'tg-' 和 corePlugins.preflight: false
   ```

3. **移除样式导入**:

   ```tsx
   // 从 app/layout.tsx 移除
   // import '@/features/ui-rescue/styles/index.css'
   ```

## 🚀 使用场景

### 救火场景

当现有 UI 出现问题时，可以快速替换：

```tsx
// 替换前
<input className="border border-gray-300 rounded px-3 py-2" />

// 替换后
<TgInput placeholder="输入内容" />
```

### 新功能开发

新功能直接使用 Telegram UI Rescue 组件：

```tsx
import { TgInput, TgButton, TgModal } from '@/features/ui-rescue'

export default function NewFeature() {
  return (
    <div>
      <TgInput label="新功能输入" />
      <TgButton variant="primary">提交</TgButton>
    </div>
  )
}
```

## 📊 性能

- ✅ **零运行时开销**: 纯 CSS 实现
- ✅ **按需加载**: 只导入使用的组件
- ✅ **Tree Shaking**: 支持代码分割
- ✅ **缓存友好**: 静态资源可长期缓存

## 🔍 调试

### 样式隔离验证

1. 打开浏览器开发者工具
2. 检查元素是否使用 `tg-` 前缀类名
3. 验证非相关页面样式未被影响

### 可访问性调试

1. 使用 axe-core 浏览器扩展
2. 运行 `npm run test:ui-rescue`
3. 检查控制台可访问性报告

## 📝 更新日志

### v1.0.0

- ✅ 初始版本
- ✅ TgInput, TgButton, TgModal 组件
- ✅ 完整的可访问性支持
- ✅ 样式隔离系统
- ✅ 移动端优化
