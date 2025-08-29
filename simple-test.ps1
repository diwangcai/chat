Write-Host "=== 网络连接测试 ===" -ForegroundColor Cyan

# 测试ping
Write-Host "`n1. 测试ping..." -ForegroundColor Yellow
ping 47.96.78.111 -n 3

# 测试SSH端口
Write-Host "`n2. 测试SSH端口..." -ForegroundColor Yellow
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("47.96.78.111", 22)
    if ($tcp.Connected) {
        Write-Host "SSH端口可访问" -ForegroundColor Green
        $tcp.Close()
    }
} catch {
    Write-Host "SSH端口不可访问: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试域名
Write-Host "`n3. 测试域名解析..." -ForegroundColor Yellow
nslookup diwangcai.com

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
