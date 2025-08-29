# 服务器状态检查脚本
Write-Host "=== 服务器状态检查 ===" -ForegroundColor Green

# 检查服务器连通性
Write-Host "1. 检查服务器连通性..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "47.96.78.111" -Count 1 -Quiet
    if ($ping) {
        Write-Host "✓ 服务器可以ping通" -ForegroundColor Green
    } else {
        Write-Host "✗ 服务器无法ping通" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Ping测试失败: $_" -ForegroundColor Red
}

# 检查SSH端口
Write-Host "2. 检查SSH端口(22)..." -ForegroundColor Yellow
try {
    $sshTest = Test-NetConnection -ComputerName "47.96.78.111" -Port 22
    if ($sshTest.TcpTestSucceeded) {
        Write-Host "✓ SSH端口22开放" -ForegroundColor Green
    } else {
        Write-Host "✗ SSH端口22关闭" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ SSH端口测试失败: $_" -ForegroundColor Red
}

# 检查HTTP端口
Write-Host "3. 检查HTTP端口(3000)..." -ForegroundColor Yellow
try {
    $httpTest = Test-NetConnection -ComputerName "47.96.78.111" -Port 3000
    if ($httpTest.TcpTestSucceeded) {
        Write-Host "✓ HTTP端口3000开放" -ForegroundColor Green
    } else {
        Write-Host "✗ HTTP端口3000关闭" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ HTTP端口测试失败: $_" -ForegroundColor Red
}

# 检查HTTPS端口
Write-Host "4. 检查HTTPS端口(443)..." -ForegroundColor Yellow
try {
    $httpsTest = Test-NetConnection -ComputerName "47.96.78.111" -Port 443
    if ($httpsTest.TcpTestSucceeded) {
        Write-Host "✓ HTTPS端口443开放" -ForegroundColor Green
    } else {
        Write-Host "✗ HTTPS端口443关闭" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ HTTPS端口测试失败: $_" -ForegroundColor Red
}

# 检查域名解析
Write-Host "5. 检查域名解析..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "diwangcai.com" -ErrorAction Stop
    Write-Host "✓ 域名解析成功: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "✗ 域名解析失败: $_" -ForegroundColor Red
}

Write-Host "`n=== 建议操作 ===" -ForegroundColor Green
Write-Host "如果SSH连接有问题，请尝试：" -ForegroundColor Yellow
Write-Host "1. 使用其他SSH客户端（如PuTTY、MobaXterm）" -ForegroundColor White
Write-Host "2. 检查服务器防火墙设置" -ForegroundColor White
Write-Host "3. 确认SSH服务正在运行" -ForegroundColor White
Write-Host "4. 尝试使用不同的端口" -ForegroundColor White
