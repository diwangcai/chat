# 服务器部署脚本
param(
    [string]$ServerIP = "47.96.78.111",
    [string]$Username = "root",
    [string]$Password = "ZZa386920091"
)

Write-Host "开始部署到服务器 $ServerIP..." -ForegroundColor Green

# 创建压缩包
Write-Host "创建项目压缩包..." -ForegroundColor Yellow
if (Test-Path "chat-app.tar.gz") {
    Remove-Item "chat-app.tar.gz" -Force
}

# 使用7zip或tar创建压缩包
try {
    tar -czf chat-app.tar.gz --exclude=node_modules --exclude=.git --exclude=test-results --exclude=.next .
    Write-Host "压缩包创建成功" -ForegroundColor Green
} catch {
    Write-Host "创建压缩包失败: $_" -ForegroundColor Red
    exit 1
}

# 尝试使用PowerShell的SSH功能上传
Write-Host "尝试上传文件到服务器..." -ForegroundColor Yellow

# 方法1: 使用PowerShell的SSH
try {
    $session = New-PSSession -HostName $ServerIP -UserName $Username -Password (ConvertTo-SecureString $Password -AsPlainText -Force)
    Write-Host "SSH连接成功" -ForegroundColor Green
    
    # 上传文件
    Copy-Item "chat-app.tar.gz" -Destination "/root/" -ToSession $session
    Write-Host "文件上传成功" -ForegroundColor Green
    
    # 在服务器上解压和部署
    Invoke-Command -Session $session -ScriptBlock {
        cd /root
        if (Test-Path "chat-app") {
            Remove-Item "chat-app" -Recurse -Force
        }
        tar -xzf chat-app.tar.gz -C /root
        mv chat-app-* chat-app 2>$null
        cd chat-app
        
        # 安装依赖
        npm install --production
        
        # 构建项目
        npm run build
        
        # 重启服务
        try {
            pm2 restart chat-app
        } catch {
            pm2 start npm --name "chat-app" -- start
        }
    }
    
    Remove-PSSession $session
    Write-Host "部署完成！" -ForegroundColor Green
    
} catch {
    Write-Host "PowerShell SSH连接失败: $_" -ForegroundColor Red
    
    # 方法2: 使用curl上传到HTTP服务器
    Write-Host "尝试使用HTTP上传..." -ForegroundColor Yellow
    try {
        # 启动一个简单的HTTP服务器来接收文件
        $uploadUrl = "http://$ServerIP/upload"
        curl -X POST -F "file=@chat-app.tar.gz" $uploadUrl
        Write-Host "HTTP上传完成" -ForegroundColor Green
    } catch {
        Write-Host "HTTP上传也失败: $_" -ForegroundColor Red
    }
}

Write-Host "部署脚本执行完成" -ForegroundColor Green
