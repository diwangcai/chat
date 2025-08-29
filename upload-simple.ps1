# 简单上传脚本
Write-Host "开始上传到服务器..." -ForegroundColor Green

# 创建压缩包
Write-Host "创建压缩包..." -ForegroundColor Yellow
tar -czf chat-app.tar.gz --exclude=node_modules --exclude=.git --exclude=test-results --exclude=.next .

# 尝试方法1: 使用PowerShell的SSH
Write-Host "尝试PowerShell SSH连接..." -ForegroundColor Yellow
try {
    $session = New-PSSession -HostName "47.96.78.111" -UserName "root" -Password (ConvertTo-SecureString "ZZa386920091" -AsPlainText -Force)
    Write-Host "SSH连接成功！" -ForegroundColor Green
    
    # 上传文件
    Copy-Item "chat-app.tar.gz" -Destination "/root/" -ToSession $session
    Write-Host "文件上传成功！" -ForegroundColor Green
    
    # 在服务器上执行部署命令
    Invoke-Command -Session $session -ScriptBlock {
        cd /root
        tar -xzf chat-app.tar.gz
        cd chat-app
        npm install
        npm run build
        pm2 restart chat-app
    }
    
    Remove-PSSession $session
    Write-Host "部署完成！" -ForegroundColor Green
    
} catch {
    Write-Host "PowerShell SSH失败: $_" -ForegroundColor Red
    
    # 方法2: 尝试使用OpenSSH
    Write-Host "尝试OpenSSH..." -ForegroundColor Yellow
    try {
        ssh -o StrictHostKeyChecking=no root@47.96.78.111 "mkdir -p /root/chat-app"
        scp -o StrictHostKeyChecking=no chat-app.tar.gz root@47.96.78.111:/root/
        ssh -o StrictHostKeyChecking=no root@47.96.78.111 "cd /root && tar -xzf chat-app.tar.gz && cd chat-app && npm install && npm run build && pm2 restart chat-app"
        Write-Host "OpenSSH部署成功！" -ForegroundColor Green
    } catch {
        Write-Host "OpenSSH也失败: $_" -ForegroundColor Red
        Write-Host "请手动上传文件到服务器" -ForegroundColor Yellow
    }
}
