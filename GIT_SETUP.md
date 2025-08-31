# Git 仓库设置指南

## 🚀 将代码上传到 GitHub

### 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub.com](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `chatapp-nextjs` (或您喜欢的名称)
   - **Description**: `现代化聊天应用 - Next.js + E2EE加密 + Gemini AI`
   - **Visibility**: 选择 Public 或 Private
   - **不要**勾选 "Add a README file" (我们已经有文件了)
4. 点击 "Create repository"

### 步骤 2: 连接本地仓库到 GitHub

创建仓库后，GitHub 会显示命令。请执行以下命令：

```bash
# 添加远程仓库 (替换 YOUR_USERNAME 和 REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3: 验证上传

1. 刷新 GitHub 页面
2. 确认所有文件都已上传
3. 检查文件结构是否正确

## 📁 项目文件结构

111·
chatapp-nextjs/
├── app/                    # Next.js 应用页面
│   ├── api/               # API 路由
│   ├── chats/             # 聊天页面
│   └── ...
├── components/            # React 组件
├── lib/                   # 工具库
│   └── e2ee/             # 端到端加密
├── hooks/                 # 自定义 Hooks
├── public/                # 静态资源
├── tests/                 # 测试文件
├── docs/                  # 文档
├── deploy-scripts/        # 部署脚本
└── 配置文件...

```

## 🔧 主要功能

- ✅ **Next.js 15.5.2** - 现代化 React 框架
- ✅ **TypeScript** - 类型安全
- ✅ **E2EE 加密** - 端到端加密聊天
- ✅ **Gemini AI** - Google AI 集成
- ✅ **Tailwind CSS** - 现代化 UI
- ✅ **Docker 部署** - 容器化部署
- ✅ **Caddy 反向代理** - 自动 HTTPS
- ✅ **单元测试** - Vitest
- ✅ **E2E 测试** - Playwright

## 🌐 部署信息

- **服务器**: 47.96.78.111
- **域名**: diwangcai.com
- **端口**: 3000 (应用), 80/443 (HTTP/HTTPS)

## 📝 环境变量

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
FAKE_AI=0
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start
```

## 📞 支持

如有问题，请查看：

- `README.md` - 项目说明
- `DEPLOY.md` - 部署指南
- `docs/E2EE.md` - 加密功能说明
