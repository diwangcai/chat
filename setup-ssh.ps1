# SSH密钥设置脚本
Write-Host "=== 设置SSH密钥认证 ===" -ForegroundColor Cyan

# 检查是否已有SSH密钥
$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
if (Test-Path $sshKeyPath) {
    Write-Host "发现现有SSH密钥: $sshKeyPath" -ForegroundColor Green
} else {
    Write-Host "生成新的SSH密钥..." -ForegroundColor Yellow
    # 创建.ssh目录
    New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" -Force | Out-Null
    
    # 生成SSH密钥
    ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""'
}

# 显示公钥
Write-Host "`n=== SSH公钥 ===" -ForegroundColor Yellow
$publicKey = Get-Content "$sshKeyPath.pub"
Write-Host $publicKey -ForegroundColor White

Write-Host "`n=== 下一步操作 ===" -ForegroundColor Cyan
Write-Host "1. 复制上面的公钥" -ForegroundColor White
Write-Host "2. 登录到服务器: ssh root@47.96.78.111" -ForegroundColor White
Write-Host "3. 将公钥添加到服务器: echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host "4. 设置权限: chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host "5. 然后就可以无密码SSH连接了" -ForegroundColor White
