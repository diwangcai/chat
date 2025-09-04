# 阿里云CLI安装指南

## Windows安装方法

### 方法1: 使用PowerShell安装（推荐）

```powershell
# 以管理员身份运行PowerShell
# 安装Chocolatey包管理器（如果没有）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 使用Chocolatey安装阿里云CLI
choco install aliyun-cli
```

### 方法2: 手动下载安装

1. 访问：<https://github.com/aliyun/aliyun-cli/releases>
2. 下载最新版本的Windows安装包
3. 解压到 `C:\Program Files\aliyun-cli\`
4. 将 `C:\Program Files\aliyun-cli\` 添加到系统PATH环境变量

### 方法3: 使用Scoop安装

```powershell
# 安装Scoop（如果没有）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 安装阿里云CLI
scoop install aliyun-cli
```

## 验证安装

```bash
# 检查版本
aliyun --version

# 检查帮助
aliyun --help
```

## 配置认证

```bash
# 配置AccessKey
aliyun configure

# 按提示输入：
# - AccessKey ID: 您的AccessKey ID
# - AccessKey Secret: 您的AccessKey Secret
# - Default Region ID: cn-hangzhou
# - Default Output Format: json
```

## 获取AccessKey

1. 登录阿里云控制台
2. 点击右上角头像 → 访问控制
3. 创建AccessKey
4. 保存AccessKey ID和Secret

## 常见问题解决

### 问题1: 命令未找到

```powershell
# 检查PATH环境变量
echo $env:PATH

# 手动添加PATH
$env:PATH += ";C:\Program Files\aliyun-cli"
```

### 问题2: 权限不足

```powershell
# 以管理员身份运行PowerShell
# 或者使用
Start-Process powershell -Verb RunAs
```

### 问题3: 网络问题

```powershell
# 设置代理（如果需要）
$env:HTTP_PROXY="http://proxy:port"
$env:HTTPS_PROXY="http://proxy:port"
```

## 快速安装脚本

```powershell
# 一键安装脚本
Write-Host "开始安装阿里云CLI..." -ForegroundColor Green

# 检查是否已安装
if (Get-Command aliyun -ErrorAction SilentlyContinue) {
    Write-Host "阿里云CLI已安装" -ForegroundColor Green
    aliyun --version
} else {
    Write-Host "正在安装阿里云CLI..." -ForegroundColor Yellow

    # 尝试使用Chocolatey安装
    try {
        choco install aliyun-cli -y
        Write-Host "安装成功！" -ForegroundColor Green
    } catch {
        Write-Host "Chocolatey安装失败，请手动安装" -ForegroundColor Red
    }
}
```
