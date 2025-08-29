# 状态检查脚本
Write-Host "=== 服务器状态检查 ===" -ForegroundColor Cyan

# 检查本地应用
Write-Host "`n1. 检查本地应用状态..." -ForegroundColor Yellow
$localApp = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($localApp) {
    Write-Host "本地Node.js应用正在运行 (PID: $($localApp.Id))" -ForegroundColor Green
}
else {
    Write-Host "本地Node.js应用未运行" -ForegroundColor Red
}

# 检查网络连接
Write-Host "`n2. 检查网络连接..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName "47.96.78.111" -Count 1 -Quiet
    if ($pingResult) {
        Write-Host "服务器网络连接正常" -ForegroundColor Green
    }
    else {
        Write-Host "服务器网络连接失败" -ForegroundColor Red
    }
}
catch {
    Write-Host "网络连接测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 检查域名解析
Write-Host "`n3. 检查域名解析..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "diwangcai.com" -Type A -ErrorAction Stop
    Write-Host "域名解析成功: $($dnsResult.IPAddress)" -ForegroundColor Green
}
catch {
    Write-Host "域名解析失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 检查端口访问
Write-Host "`n4. 检查端口访问..." -ForegroundColor Yellow
$ports = @(80, 443, 3000)
foreach ($port in $ports) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ConnectAsync("47.96.78.111", $port).Wait(3000) | Out-Null
        if ($tcpClient.Connected) {
            Write-Host "端口 $port 可访问" -ForegroundColor Green
        }
        else {
            Write-Host "端口 $port 不可访问" -ForegroundColor Red
        }
        $tcpClient.Close()
    }
    catch {
        Write-Host "端口 $port 测试失败" -ForegroundColor Red
    }
}

Write-Host "`n=== 检查完成 ===" -ForegroundColor Cyan
Write-Host "如果所有检查都通过，域名应该可以正常访问" -ForegroundColor Green
