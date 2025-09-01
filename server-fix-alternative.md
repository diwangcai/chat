# 服务器修复替代方案

## 方案1: 使用阿里云控制台

### 1. 登录阿里云控制台

- 访问: <https://ecs.console.aliyun.com/>
- 登录您的阿里云账号

### 2. 找到您的实例

- 在ECS控制台中找到IP为 `47.96.78.111` 的实例
- 点击实例ID进入详情页

### 3. 使用云助手执行命令

- 在实例详情页找到"云助手"选项
- 点击"发送命令"
- 选择"Shell脚本"
- 执行以下命令：

```bash
# 清理磁盘空间
df -h
npm cache clean --force
sudo apt-get clean
sudo apt-get autoremove

# 安装PM2
npm install -g pm2

# 重新安装项目依赖
cd /home/shell
rm -rf node_modules package-lock.json
npm install --production

# 构建和启动项目
npm run build
pm2 start npm --name "chat-app" -- start

# 检查状态
pm2 status
netstat -tlnp | grep :3000
```

## 方案2: 使用阿里云CloudShell

### 1. 访问CloudShell

- 访问: <https://shell.aliyun.com/>
- 登录您的阿里云账号

### 2. 连接到实例

```bash
# 使用SSH连接到实例
ssh root@47.96.78.111
# 密码: ZZa386920091
```

### 3. 执行修复命令

```bash
# 检查磁盘空间
df -h

# 清理空间
npm cache clean --force
sudo apt-get clean
sudo apt-get autoremove

# 安装PM2
npm install -g pm2

# 重新安装依赖
cd /home/shell
rm -rf node_modules package-lock.json
npm install --production

# 构建和启动
npm run build
pm2 start npm --name "chat-app" -- start

# 检查状态
pm2 status
```

## 方案3: 使用第三方SSH客户端

### 推荐工具

1. **PuTTY** - 免费SSH客户端
2. **MobaXterm** - 功能强大的终端工具
3. **FinalShell** - 中文友好的SSH工具

### 连接信息

- 主机: 47.96.78.111
- 端口: 22
- 用户名: root
- 密码: ZZa386920091

### 执行命令

连接后执行上述修复命令即可。

## 方案4: 使用阿里云API

如果您有编程经验，可以使用阿里云SDK：

- Python SDK: <https://github.com/aliyun/aliyun-python-sdk-ecs>
- Node.js SDK: <https://github.com/aliyun/aliyun-sdk-js>

## 推荐方案

建议使用**方案1（阿里云控制台云助手）**，这是最简单直接的方法，无需安装任何工具。
