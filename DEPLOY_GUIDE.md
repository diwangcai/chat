# 服务器部署指南

## 当前状态

✅ 服务器可以ping通 (47.96.78.111)  
✅ SSH端口22开放  
❌ HTTP端口3000关闭 (应用未运行)  
❌ HTTPS端口443关闭 (Caddy未运行)  

## 手动部署步骤

### 1. 使用SSH客户端连接服务器

推荐使用以下SSH客户端之一：

- **PuTTY** (Windows)
- **MobaXterm** (Windows)
- **Termius** (跨平台)
- **FinalShell** (跨平台)

连接信息：

- 主机: 47.96.78.111
- 端口: 22
- 用户名: root
- 密码: ZZa386920091

### 2. 上传项目文件

将 `chat-app.tar.gz` 文件上传到服务器：

```bash
# 使用scp命令上传
scp chat-app.tar.gz root@47.96.78.111:/root/
```

### 3. 在服务器上部署

连接到服务器后执行以下命令：

```bash
# 进入root目录
cd /root

# 备份旧版本（如果存在）
if [ -d "chat-app" ]; then
    mv chat-app chat-app-backup-$(date +%Y%m%d-%H%M%S)
fi

# 解压新版本
tar -xzf chat-app.tar.gz

# 如果解压后的目录名不是chat-app，重命名
if [ -d "聊天" ]; then
    mv 聊天 chat-app
fi

# 进入项目目录
cd chat-app

# 检查Node.js版本
node --version
npm --version

# 安装依赖
npm install --production

# 构建项目
npm run build

# 检查pm2是否安装
pm2 --version

# 如果pm2未安装，先安装
npm install -g pm2

# 启动或重启服务
pm2 restart chat-app || pm2 start npm --name "chat-app" -- start

# 检查服务状态
pm2 status
pm2 logs chat-app
```

### 4. 配置Caddy反向代理

```bash
# 检查Caddy是否安装
caddy version

# 如果未安装，安装Caddy
snap install caddy

# 创建Caddy配置文件
sudo tee /etc/caddy/Caddyfile << EOF
diwangcai.com {
    reverse_proxy localhost:3000
    log {
        output file /var/log/caddy/diwangcai.com.log
    }
}
EOF

# 启动Caddy服务
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

### 5. 检查防火墙设置

```bash
# 检查防火墙状态
ufw status

# 如果需要，开放端口
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000
```

### 6. 验证部署

```bash
# 检查服务状态
pm2 status
netstat -tlnp | grep :3000

# 检查Caddy状态
sudo systemctl status caddy
netstat -tlnp | grep :443

# 测试本地访问
curl http://localhost:3000
```

## 故障排除

### 如果SSH连接失败

1. 检查网络连接
2. 尝试不同的SSH客户端
3. 检查服务器防火墙设置
4. 联系服务器提供商

### 如果应用启动失败

1. 检查Node.js版本 (建议 v18+)
2. 检查npm版本
3. 查看错误日志: `pm2 logs chat-app`
4. 检查磁盘空间: `df -h`
5. 检查内存使用: `free -h`

### 如果Caddy启动失败

1. 检查配置文件语法: `caddy validate /etc/caddy/Caddyfile`
2. 检查端口占用: `netstat -tlnp | grep :443`
3. 查看Caddy日志: `sudo journalctl -u caddy`

## 访问应用

部署成功后，可以通过以下方式访问：

- HTTP: <http://47.96.78.111:3000>
- HTTPS: <https://diwangcai.com> (如果域名配置正确)
