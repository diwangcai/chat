# 部署指南

## 快速部署

### 1. 准备环境变量

创建 `.env` 文件：

```bash
# 复制示例文件
cp env.example .env

# 编辑环境变量
nano .env
```

设置以下变量：

- `GEMINI_API_KEY`: 你的 Gemini API 密钥
- `FAKE_AI`: 设置为 `1` 使用复读模式（测试），设置为 `0` 使用真实 API

### 2. 一键部署

```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 3. 手动部署

```bash
# 构建并启动
docker compose up -d --build

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f
```

## 访问应用

- **本地访问**: <http://localhost:3000>
- **服务器访问**: <http://47.96.78.111>

## 管理命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f app
docker compose logs -f caddy

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
docker compose down
docker compose up -d --build
```

## 故障排除

### 1. 端口占用

```bash
# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :80

# 停止占用进程
sudo kill -9 <PID>
```

### 2. 健康检查失败

```bash
# 检查应用日志
docker compose logs app

# 手动健康检查
curl http://localhost:3000/api/health
```

### 3. CSP 问题

确保 Caddy 配置中没有额外的 CSP 头：

- 检查 `/etc/caddy/Caddyfile`
- 确保只有 `header { -Content-Security-Policy }`

### 4. 权限问题

```bash
# 修复文件权限
sudo chown -R $USER:$USER /opt/chatapp
chmod +x deploy.sh
```

## 生产环境配置

### 1. 域名配置

编辑 `Caddyfile`，将 `47.96.78.111` 替换为你的域名：

```caddy
your-domain.com {
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Forwarded-Proto {scheme}
    }
    
    header {
        -Content-Security-Policy
    }
}
```

### 2. SSL 证书

Caddy 会自动处理 SSL 证书。确保：

- 域名已正确解析到服务器
- 防火墙开放 80 和 443 端口

### 3. 环境变量

生产环境建议设置：

```bash
NODE_ENV=production
FAKE_AI=0
GEMINI_API_KEY=your_real_api_key
GEMINI_MODEL=gemini-2.5-flash
```

## 监控和维护

### 1. 日志轮转

```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/docker-compose

# 添加内容
/opt/chatapp/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

### 2. 自动重启

Docker Compose 已配置 `restart: unless-stopped`，服务会自动重启。

### 3. 备份

```bash
# 备份数据目录
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# 恢复备份
tar -xzf backup-20231201.tar.gz
```
