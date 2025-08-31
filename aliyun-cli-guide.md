# 阿里云CLI服务器管理指南

## 安装阿里云CLI

### Windows

```bash
# 下载并安装
# 访问: https://help.aliyun.com/document_detail/121541.html
```

### 配置认证

```bash
# 配置AccessKey
aliyun configure
# 输入您的AccessKey ID和AccessKey Secret
```

## 查找实例ID

```bash
# 列出所有ECS实例
aliyun ecs DescribeInstances --RegionId cn-hangzhou

# 或者通过公网IP查找
aliyun ecs DescribeInstances --RegionId cn-hangzhou --PublicIpAddresses.1 47.96.78.111
```

## 服务器修复命令

### 1. 检查磁盘空间

```bash
aliyun ecs RunCommand \
  --InstanceId i-xxx \
  --RegionId cn-hangzhou \
  --CommandContent "df -h"
```

### 2. 清理磁盘空间

```bash
aliyun ecs RunCommand \
  --InstanceId i-xxx \
  --RegionId cn-hangzhou \
  --CommandContent "npm cache clean --force && sudo apt-get clean && sudo apt-get autoremove"
```

### 3. 安装PM2

```bash
aliyun ecs RunCommand \
  --InstanceId i-xxx \
  --RegionId cn-hangzhou \
  --CommandContent "npm install -g pm2"
```

### 4. 重新安装项目依赖

```bash
aliyun ecs RunCommand \
  --InstanceId i-xxx \
  --RegionId cn-hangzhou \
  --CommandContent "cd /home/shell && rm -rf node_modules package-lock.json && npm install --production"
```

### 5. 构建和启动项目

```bash
aliyun ecs RunCommand \
  --InstanceId i-xxx \
  --RegionId cn-hangzhou \
  --CommandContent "cd /home/shell && npm run build && pm2 start npm --name 'chat-app' -- start"
```

### 6. 检查服务状态

```bash
aliyun ecs RunCommand \
  --InstanceId i-xxx \
  --RegionId cn-hangzhou \
  --CommandContent "pm2 status && netstat -tlnp | grep :3000"
```

## 一键修复脚本

```bash
# 替换INSTANCE_ID为您的实例ID
INSTANCE_ID="i-xxx"
REGION="cn-hangzhou"

echo "开始修复服务器..."
aliyun ecs RunCommand --InstanceId $INSTANCE_ID --RegionId $REGION --CommandContent "df -h && npm cache clean --force && sudo apt-get clean && sudo apt-get autoremove"
aliyun ecs RunCommand --InstanceId $INSTANCE_ID --RegionId $REGION --CommandContent "npm install -g pm2"
aliyun ecs RunCommand --InstanceId $INSTANCE_ID --RegionId $REGION --CommandContent "cd /home/shell && rm -rf node_modules package-lock.json && npm install --production"
aliyun ecs RunCommand --InstanceId $INSTANCE_ID --RegionId $REGION --CommandContent "cd /home/shell && npm run build && pm2 start npm --name 'chat-app' -- start"
aliyun ecs RunCommand --InstanceId $INSTANCE_ID --RegionId $REGION --CommandContent "pm2 status"
```

## 查看命令执行结果

```bash
# 查看命令执行状态
aliyun ecs DescribeInvocationResults --InvokeId xxx --RegionId cn-hangzhou
```

## 注意事项

1. 需要先安装并配置阿里云CLI
2. 需要获取实例ID (i-xxx格式)
3. 确保有足够的权限执行命令
4. 命令执行可能需要几分钟时间
