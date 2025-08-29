# 网络诊断脚本
Write-Host "=== 网络连接诊断 ===" -ForegroundColor Cyan

# 1. 检查基本网络连接
Write-Host "`n1. 检查基本网络连接..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName "47.96.78.111" -Count 3 -Quiet
    if ($pingResult) {
        Write-Host "✓ 服务器网络连接正常" -ForegroundColor Green
    } else {
        Write-Host "✗ 服务器网络连接失败" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 网络连接测试异常: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 检查SSH端口
Write-Host "`n2. 检查SSH端口 (22)..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ConnectAsync("47.96.78.111", 22).Wait(5000) | Out-Null
    if ($tcpClient.Connected) {
        Write-Host "✓ SSH端口 (22) 可访问" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "✗ SSH端口 (22) 不可访问" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ SSH端口测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 检查域名解析
Write-Host "`n3. 检查域名解析..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "diwangcai.com" -Type A -ErrorAction Stop
    Write-Host "✓ 域名解析成功: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "✗ 域名解析失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 诊断完成 ===" -ForegroundColor Cyan
