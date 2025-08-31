# 服务器连接测试脚本
Write-Host "正在测试服务器连接..." -ForegroundColor Green

$serverIP = "47.96.78.111"

# 1. 测试网络连通性
Write-Host "`n1. 测试网络连通性..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $serverIP -Count 4 -Quiet
if ($pingResult) {
    Write-Host "✓ 网络连通性正常" -ForegroundColor Green
} else {
    Write-Host "✗ 网络连通性异常" -ForegroundColor Red
}

# 2. 测试SSH端口
Write-Host "`n2. 测试SSH端口..." -ForegroundColor Yellow
$tcpResult = Test-NetConnection -ComputerName $serverIP -Port 22 -InformationLevel Quiet
if ($tcpResult) {
    Write-Host "✓ SSH端口(22)可访问" -ForegroundColor Green
} else {
    Write-Host "✗ SSH端口(22)不可访问" -ForegroundColor Red
}

# 3. 提供连接建议
Write-Host "`n3. 连接建议..." -ForegroundColor Yellow
Write-Host "如果SSH连接失败，建议使用以下替代方案：" -ForegroundColor Cyan
Write-Host "• 阿里云控制台云助手: https://ecs.console.aliyun.com/" -ForegroundColor White
Write-Host "• 阿里云CloudShell: https://shell.aliyun.com/" -ForegroundColor White
Write-Host "• 第三方SSH工具: PuTTY, MobaXterm, FinalShell" -ForegroundColor White

Write-Host "`n连接测试完成！" -ForegroundColor Green
