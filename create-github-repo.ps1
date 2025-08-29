# GitHub 仓库创建脚本
Write-Host "=== GitHub 仓库创建向导 ===" -ForegroundColor Cyan

# 获取用户输入
$username = Read-Host "请输入您的 GitHub 用户名"
$repoName = Read-Host "请输入仓库名称 (默认: chatapp-nextjs)" 
if ([string]::IsNullOrEmpty($repoName)) {
    $repoName = "chatapp-nextjs"
}

$description = Read-Host "请输入仓库描述 (默认: 现代化聊天应用 - Next.js + E2EE加密 + Gemini AI)"
if ([string]::IsNullOrEmpty($description)) {
    $description = "现代化聊天应用 - Next.js + E2EE加密 + Gemini AI"
}

$visibility = Read-Host "选择可见性 (public/private, 默认: public)"
if ([string]::IsNullOrEmpty($visibility)) {
    $visibility = "public"
}

Write-Host "`n=== 仓库信息 ===" -ForegroundColor Yellow
Write-Host "用户名: $username" -ForegroundColor White
Write-Host "仓库名: $repoName" -ForegroundColor White
Write-Host "描述: $description" -ForegroundColor White
Write-Host "可见性: $visibility" -ForegroundColor White

$confirm = Read-Host "`n确认创建仓库? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "取消创建" -ForegroundColor Red
    exit
}

# 创建仓库的URL
$repoUrl = "https://github.com/$username/$repoName"

Write-Host "`n=== 手动创建步骤 ===" -ForegroundColor Yellow
Write-Host "1. 访问: https://github.com/new" -ForegroundColor White
Write-Host "2. 填写信息:" -ForegroundColor White
Write-Host "   - Repository name: $repoName" -ForegroundColor Gray
Write-Host "   - Description: $description" -ForegroundColor Gray
Write-Host "   - Visibility: $visibility" -ForegroundColor Gray
Write-Host "   - 不要勾选 'Add a README file'" -ForegroundColor Gray
Write-Host "3. 点击 'Create repository'" -ForegroundColor White

Write-Host "`n=== 创建完成后执行以下命令 ===" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/$username/$repoName.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White

Write-Host "`n=== 或者使用以下一键脚本 ===" -ForegroundColor Green
Write-Host ".\push-to-github.ps1" -ForegroundColor White

# 创建推送脚本
$pushScript = @"
# 自动推送到 GitHub
Write-Host "正在推送到 GitHub..." -ForegroundColor Yellow

# 添加远程仓库
git remote add origin https://github.com/$username/$repoName.git

# 重命名分支为 main
git branch -M main

# 推送到 GitHub
git push -u origin main

Write-Host "推送完成！" -ForegroundColor Green
Write-Host "仓库地址: $repoUrl" -ForegroundColor Cyan
"@

$pushScript | Out-File -FilePath "push-to-github.ps1" -Encoding UTF8

Write-Host "`n已创建推送脚本: push-to-github.ps1" -ForegroundColor Green
Write-Host "创建仓库后运行: .\push-to-github.ps1" -ForegroundColor White
