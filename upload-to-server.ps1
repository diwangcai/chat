# 上传到服务器脚本
Write-Host "=== 上传到服务器 ===" -ForegroundColor Green

# 检查压缩包是否存在
if (Test-Path "chat-app.tar.gz") {
    Write-Host "✓ 找到压缩包: chat-app.tar.gz" -ForegroundColor Green
    $fileSize = (Get-Item "chat-app.tar.gz").Length
    Write-Host "文件大小: $([math]::Round($fileSize/1MB, 2)) MB" -ForegroundColor Yellow
} else {
    Write-Host "✗ 未找到压缩包，正在创建..." -ForegroundColor Red
    tar -czf chat-app.tar.gz --exclude=node_modules --exclude=.git --exclude=test-results --exclude=.next .
}

Write-Host "`n=== 上传方法 ===" -ForegroundColor Green
Write-Host "由于SSH连接问题，请使用以下方法之一上传：" -ForegroundColor Yellow

Write-Host "`n方法1: 使用其他SSH客户端" -ForegroundColor Cyan
Write-Host "1. 下载并安装 PuTTY 或 MobaXterm" -ForegroundColor White
Write-Host "2. 连接到服务器: 47.96.78.111:22" -ForegroundColor White
Write-Host "3. 用户名: root, 密码: ZZa386920091" -ForegroundColor White
Write-Host "4. 使用SFTP功能上传 chat-app.tar.gz 到 /root/" -ForegroundColor White

Write-Host "`n方法2: 使用命令行SCP" -ForegroundColor Cyan
Write-Host "在Git Bash或其他终端中运行：" -ForegroundColor White
Write-Host "scp chat-app.tar.gz root@47.96.78.111:/root/" -ForegroundColor White

Write-Host "`n方法3: 使用文件传输工具" -ForegroundColor Cyan
Write-Host "1. 使用 FileZilla、WinSCP 等工具" -ForegroundColor White
Write-Host "2. 连接到服务器并上传文件" -ForegroundColor White

Write-Host "`n=== 部署命令 ===" -ForegroundColor Green
Write-Host "上传完成后，在服务器上执行以下命令：" -ForegroundColor Yellow
Write-Host @"
cd /root
tar -xzf chat-app.tar.gz
cd chat-app
npm install --production
npm run build
pm2 restart chat-app || pm2 start npm --name 'chat-app' -- start
"@ -ForegroundColor White

Write-Host "`n=== 验证部署 ===" -ForegroundColor Green
Write-Host "部署完成后，检查以下地址：" -ForegroundColor Yellow
Write-Host "• http://47.96.78.111:3000" -ForegroundColor White
Write-Host "• https://diwangcai.com" -ForegroundColor White
