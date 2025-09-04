# 聊天应用

现代化的聊天应用，支持实时消息、文件分享、端到端加密等功能。

## 功能特性

- 🚀 **实时聊天**: 基于 WebSocket 的实时消息传递
- 🔒 **端到端加密**: 保护用户隐私和数据安全
- 📱 **响应式设计**: 完美适配桌面端和移动端
- ♿ **无障碍支持**: 完整的可访问性支持
- 🎨 **现代 UI**: 基于 Tailwind CSS 的现代化界面
- 🔍 **智能搜索**: 支持用户、群组、频道搜索
- 📁 **文件分享**: 支持图片、文档等多种文件类型

## 技术栈

- **前端**: Next.js 15, React 18, TypeScript
- **样式**: Tailwind CSS, Framer Motion
- **状态管理**: React Hooks, Context API
- **测试**: Playwright, Vitest, axe-core
- **代码质量**: ESLint, Prettier, Husky

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 测试

### 单元测试

```bash
npm run test:unit
```

### 端到端测试

```bash
npm run test:e2e
```

### 可访问性测试

```bash
npm run test:a11y
```

### UI 测试

```bash
npm run test:ui
```

## 可访问性

本项目严格遵循 WCAG 2.1 AA 标准，确保所有用户都能正常使用。

### 自动检测

- **开发时**: axe-core 自动检测可访问性问题
- **提交前**: ESLint + Playwright 自动检查
- **CI/CD**: 完整的可访问性测试流程

### 常见 UI 失败原因与修复表

| 问题类型 | 错误信息 | 原因 | 修复方法 |
|---------|---------|------|---------|
| **对比度不足** | `color-contrast` | 文本与背景对比度低于 4.5:1 | 调整颜色，使用对比度检查工具 |
| **按钮无文本** | `button-name` | 按钮缺少可访问的名称 | 添加 `aria-label` 或可见文本 |
| **图片无描述** | `image-alt` | 图片缺少 alt 属性 | 添加有意义的 `alt` 文本 |
| **链接无文本** | `link-name` | 链接缺少可访问的名称 | 添加文本内容或 `aria-label` |
| **标题顺序错误** | `heading-order` | 标题层级跳跃（如 h1 后直接 h3） | 按顺序使用 h1, h2, h3... |
| **语言未设置** | `html-has-lang` | HTML 元素缺少 lang 属性 | 在 `<html>` 标签添加 `lang="zh-CN"` |
| **缺少主区域** | `landmark-one-main` | 页面缺少 `<main>` 元素 | 添加 `<main>` 标签包装主要内容 |
| **焦点顺序** | `focus-order-semantics` | 焦点顺序不符合逻辑 | 调整 tabindex 或元素顺序 |
| **键盘支持** | `keyboard` | 可交互元素无法通过键盘访问 | 添加键盘事件处理 |
| **ARIA 属性** | `aria-*` 相关错误 | ARIA 属性使用不当 | 检查 ARIA 属性语法和语义 |

### 修复示例

#### 对比度问题

```tsx
// ❌ 错误：对比度不足
<button className="bg-gray-300 text-gray-400">按钮</button>

// ✅ 正确：对比度足够
<button className="bg-blue-600 text-white">按钮</button>
```

#### 按钮可访问性

```tsx
// ❌ 错误：按钮无文本
<button onClick={handleClick}>
  <Icon />
</button>

// ✅ 正确：添加 aria-label
<button onClick={handleClick} aria-label="发送消息">
  <Icon />
</button>
```

#### 图片可访问性

```tsx
// ❌ 错误：图片无描述
<img src="/avatar.jpg" />

// ✅ 正确：添加 alt 属性
<img src="/avatar.jpg" alt="用户头像" />
```

#### 标题结构

```tsx
// ❌ 错误：标题顺序跳跃
<h1>主标题</h1>
<h3>子标题</h3>

// ✅ 正确：按顺序使用
<h1>主标题</h1>
<h2>子标题</h2>
```

## 代码质量

### 代码检查

```bash
npm run lint
npm run lint:fix
```

### 类型检查

```bash
npm run typecheck
```

### 提交前检查

项目配置了 Husky + lint-staged，提交前会自动：

- 运行 ESLint 检查
- 运行 Prettier 格式化
- 运行可访问性测试

## 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### Docker 部署

```bash
docker build -t chat-app .
docker run -p 3000:3000 chat-app
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发规范

- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier 保持代码风格一致
- 编写单元测试和端到端测试
- 确保所有可访问性测试通过
- 更新相关文档

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请：

- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件至 <support@example.com>
- 查看 [文档](https://docs.example.com)

---

**注意**: 这是一个演示项目，请勿在生产环境中使用真实用户数据。
