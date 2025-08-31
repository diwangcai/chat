# 项目架构文档

## 基线与规范

### 布局规范

- 使用 `100dvh/svh` 而非 `100vh`
- 主布局用 flex，禁止 position:absolute/float
- 滚动容器必须设置 `min-height: 0`
- 顶/底栏优先用 `position: sticky`

### 样式规范

- 全局 `* { box-sizing: border-box; }`
- 使用设计 Token 变量，禁止硬编码
- 表单元素统一高度和间距

### 交互规范

- 弹层必须支持点击外部/Escape 关闭
- 输入框 Enter 发送，Shift+Enter 换行
- 移动端软键盘适配

### 质量要求

- TypeScript strict 模式
- ESLint/Stylelint 零警告
- 关键交互必须有端到端测试

## 组件架构

### 布局组件

- `app/page.tsx`: 主页面布局
- `components/ChatHeader.tsx`: 聊天头部
- `components/MessageList.tsx`: 消息列表
- `components/MessageInput.tsx`: 输入区域

### 功能组件

- `components/FriendList.tsx`: 好友管理
- `components/ConversationList.tsx`: 对话列表
- `components/EmojiPicker.tsx`: 表情选择器
- `components/InfoDrawer.tsx`: 信息抽屉

### 工具组件

- `hooks/useEncryption.ts`: 加密功能
- `hooks/useImageUpload.ts`: 图片上传
- `utils/date.ts`: 日期工具
- `lib/storage.ts`: 存储工具

## 数据流

### 状态管理

- 使用 React useState 进行本地状态管理
- localStorage 进行持久化存储
- 组件间通过 props 传递数据

### 数据流

1. 用户操作触发状态更新
2. 状态更新触发组件重渲染
3. 组件更新触发 UI 变化
4. 重要数据保存到 localStorage

## 测试策略

### 单元测试

- 工具函数测试
- 组件逻辑测试
- Hook 测试

### 集成测试

- 组件交互测试
- 数据流测试
- 状态管理测试

### 端到端测试

- 用户流程测试
- 跨浏览器测试
- 移动端适配测试

## 部署架构

### 开发环境

- Next.js 开发服务器
- 热重载
- 开发工具

### 生产环境

- Vercel 部署
- 自动构建
- CDN 加速

## 性能优化

### 代码分割

- 动态导入
- 路由分割
- 组件懒加载

### 缓存策略

- 静态资源缓存
- API 响应缓存
- 浏览器缓存

### 渲染优化

- 虚拟滚动
- 防抖节流
- 内存管理
