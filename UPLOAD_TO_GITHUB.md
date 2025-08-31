# 🚀 上传到 GitHub 的简单步骤

## 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub.com](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `chatapp-nextjs`
   - **Description**: `现代化聊天应用 - Next.js + E2EE加密 + Gemini AI`
   - **Visibility**: `Public` 或 `Private`
   - **不要勾选** "Add a README file"
4. 点击 "Create repository"

## 步骤 2: 上传代码

创建仓库后，在您的终端中执行以下命令：

```bash
# 添加远程仓库 (替换 YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/chatapp-nextjs.git

# 重命名分支为 main
git branch -M main

# 推送代码
git push -u origin main
```

## 步骤 3: 验证

1. 刷新 GitHub 页面
2. 确认所有文件都已上传
3. 检查文件结构

## 📁 项目包含的文件

- ✅ **Next.js 应用** - 完整的聊天应用
- ✅ **E2EE 加密** - 端到端加密功能
- ✅ **Gemini AI** - Google AI 集成
- ✅ **部署配置** - Docker、Caddy 等
- ✅ **测试文件** - 单元测试和 E2E 测试
- ✅ **文档** - 详细的使用说明

## 🌐 在线访问

- **服务器**: 47.96.78.111
- **域名**: diwangcai.com
- **状态**: 已部署并运行

## 📞 需要帮助？

如果遇到问题，请检查：

1. GitHub 用户名是否正确
2. 网络连接是否正常
3. Git 是否已安装

## 🎯 快速命令

```bash
# 一键上传 (替换 YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/chatapp-nextjs.git && git branch -M main && git push -u origin main
```
