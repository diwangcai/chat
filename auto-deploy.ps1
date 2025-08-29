# 自动域名配置脚本
Write-Host "=== 自动配置域名 diwangcai.com ===" -ForegroundColor Cyan

# 检查SSH是否可用
Write-Host "1. 检查SSH连接..." -ForegroundColor Yellow
try {
    $testResult = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@47.96.78.111 "echo 'SSH连接成功'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SSH连接正常" -ForegroundColor Green
    } else {
        Write-Host "SSH连接失败，尝试其他方法..." -ForegroundColor Red
    }
} catch {
    Write-Host "SSH连接异常: $($_.Exception.Message)" -ForegroundColor Red
}

# 方法1: 使用sshpass (如果可用)
Write-Host "2. 尝试使用sshpass..." -ForegroundColor Yellow
try {
    sshpass -p "ZZa386920091" ssh -o StrictHostKeyChecking=no root@47.96.78.111 "cd /opt/chatapp && echo 'diwangcai.com { reverse_proxy localhost:3000 }' > Caddyfile"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Caddyfile配置成功" -ForegroundColor Green
    }
} catch {
    Write-Host "sshpass不可用，尝试方法2..." -ForegroundColor Yellow
}

# 方法2: 使用PowerShell的SSH模块
Write-Host "3. 尝试PowerShell SSH模块..." -ForegroundColor Yellow
try {
    # 创建SSH会话
    $session = New-PSSession -HostName "47.96.78.111" -UserName "root" -Password (ConvertTo-SecureString "ZZa386920091" -AsPlainText -Force)
    if ($session) {
        Write-Host "PowerShell SSH会话创建成功" -ForegroundColor Green
        
        # 执行配置命令
        Invoke-Command -Session $session -ScriptBlock {
            cd /opt/chatapp
            echo "diwangcai.com { reverse_proxy localhost:3000 }" > Caddyfile
            echo "Caddyfile配置完成"
        }
        
        # 启动Caddy
        Invoke-Command -Session $session -ScriptBlock {
            cd /opt/chatapp
            pkill caddy 2>$null
            nohup caddy run --config Caddyfile > caddy.log 2>&1 &
            echo "Caddy启动完成"
        }
        
        # 检查状态
        Start-Sleep 3
        Invoke-Command -Session $session -ScriptBlock {
            netstat -tlnp | grep :80
        }
        
        Remove-PSSession $session
    }
} catch {
    Write-Host "PowerShell SSH模块失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 方法3: 使用curl测试域名
Write-Host "4. 测试域名访问..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://diwangcai.com" -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "域名访问成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "域名访问失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== 配置完成 ===" -ForegroundColor Cyan
Write-Host "如果自动配置失败，请手动执行以下命令:" -ForegroundColor Yellow
Write-Host "ssh root@47.96.78.111" -ForegroundColor White
Write-Host "cd /opt/chatapp" -ForegroundColor White
Write-Host "echo 'diwangcai.com { reverse_proxy localhost:3000 }' > Caddyfile" -ForegroundColor White
Write-Host "caddy run --config Caddyfile &" -ForegroundColor White
