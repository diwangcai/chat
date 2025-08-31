# 服务器修复脚本
Write-Host "=== 服务器问题修复指南 ===" -ForegroundColor Green

Write-Host "`n=== 问题分析 ===" -ForegroundColor Yellow
Write-Host "1. pm2: command not found - PM2未安装" -ForegroundColor Red
Write-Host "2. ENOSPC: no space left on device - 磁盘空间不足" -ForegroundColor Red
Write-Host "3. next: command not found - Next.js依赖未正确安装" -ForegroundColor Red

Write-Host "`n=== 解决方案 ===" -ForegroundColor Green

Write-Host "`n步骤1: 清理磁盘空间" -ForegroundColor Cyan
Write-Host "在服务器上执行以下命令：" -ForegroundColor White
Write-Host @"
# 检查磁盘使用情况
df -h

# 清理npm缓存
npm cache clean --force

# 清理系统缓存
sudo apt-get clean
sudo apt-get autoremove

# 清理日志文件
sudo journalctl --vacuum-time=7d

# 清理临时文件
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# 检查大文件
sudo find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -10
"@ -ForegroundColor Gray

Write-Host "`n步骤2: 安装PM2" -ForegroundColor Cyan
Write-Host "在服务器上执行：" -ForegroundColor White
Write-Host @"
# 全局安装PM2
npm install -g pm2

# 验证安装
pm2 --version
"@ -ForegroundColor Gray

Write-Host "`n步骤3: 重新安装项目依赖" -ForegroundColor Cyan
Write-Host "在项目目录中执行：" -ForegroundColor White
Write-Host @"
# 进入项目目录
cd /home/shell

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install

# 验证Next.js安装
npx next --version
"@ -ForegroundColor Gray

Write-Host "`n步骤4: 构建和启动项目" -ForegroundColor Cyan
Write-Host "执行构建和启动：" -ForegroundColor White
Write-Host @"
# 构建项目
npm run build

# 使用PM2启动
pm2 start npm --name "chat-app" -- start

# 检查状态
pm2 status
pm2 logs chat-app
"@ -ForegroundColor Gray

Write-Host "`n=== 替代方案 ===" -ForegroundColor Green
Write-Host "如果磁盘空间仍然不足，可以尝试：" -ForegroundColor Yellow
Write-Host @"
# 使用生产模式安装（减少依赖）
npm install --production

# 或者使用yarn（更节省空间）
npm install -g yarn
yarn install --production

# 或者使用pnpm（最节省空间）
npm install -g pnpm
pnpm install --prod
"@ -ForegroundColor Gray

Write-Host "`n=== 监控命令 ===" -ForegroundColor Green
Write-Host "部署后使用以下命令监控：" -ForegroundColor Yellow
Write-Host @"
# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看PM2状态
pm2 status

# 查看应用日志
pm2 logs chat-app

# 查看端口占用
netstat -tlnp | grep :3000
"@ -ForegroundColor Gray
