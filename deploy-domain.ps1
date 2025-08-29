# 域名配置脚本
Write-Host "正在配置域名 diwangcai.com..." -ForegroundColor Green

# 1. 创建SSH命令
$sshCmd = "cd /opt/chatapp && echo 'diwangcai.com { reverse_proxy localhost:3000 }' > Caddyfile"

# 2. 执行SSH命令
Write-Host "上传Caddyfile配置..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@47.96.78.111 $sshCmd

# 3. 启动Caddy
Write-Host "启动Caddy服务..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@47.96.78.111 "cd /opt/chatapp && nohup caddy run --config Caddyfile > caddy.log 2>&1 &"

# 4. 等待并检查
Start-Sleep 3
Write-Host "检查服务状态..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@47.96.78.111 "netstat -tlnp | grep :80"

# 5. 测试访问
Write-Host "测试域名访问..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://diwangcai.com" -TimeoutSec 10
    Write-Host "域名访问成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "域名访问失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "配置完成！" -ForegroundColor Green
