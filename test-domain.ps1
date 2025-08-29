# 域名测试脚本
Write-Host "=== 测试域名 diwangcai.com ===" -ForegroundColor Cyan

# 测试DNS解析
Write-Host "1. 测试DNS解析..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "diwangcai.com" -Type A
    Write-Host "DNS解析成功: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "DNS解析失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试HTTP访问
Write-Host "`n2. 测试HTTP访问..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://diwangcai.com" -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "HTTP访问成功: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应头: $($response.Headers.Location)" -ForegroundColor Gray
} catch {
    Write-Host "HTTP访问失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试HTTPS访问
Write-Host "`n3. 测试HTTPS访问..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://diwangcai.com" -TimeoutSec 10
    Write-Host "HTTPS访问成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "HTTPS访问失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试IP直接访问
Write-Host "`n4. 测试IP直接访问..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://47.96.78.111:3000" -TimeoutSec 10
    Write-Host "IP直接访问成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "IP直接访问失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
