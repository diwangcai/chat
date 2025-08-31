#!/bin/bash

# 阿里云CLI服务器修复脚本
echo "=== 使用阿里云CLI修复服务器问题 ==="

# 设置变量
INSTANCE_ID="your-instance-id"  # 替换为您的实例ID
REGION="cn-hangzhou"  # 替换为您的区域

echo "1. 检查实例状态..."
aliyun ecs DescribeInstanceStatus --InstanceId $INSTANCE_ID --RegionId $REGION

echo "2. 连接到实例并清理磁盘空间..."
aliyun ecs RunCommand \
  --InstanceId $INSTANCE_ID \
  --RegionId $REGION \
  --CommandContent "df -h && npm cache clean --force && sudo apt-get clean && sudo apt-get autoremove"

echo "3. 安装PM2..."
aliyun ecs RunCommand \
  --InstanceId $INSTANCE_ID \
  --RegionId $REGION \
  --CommandContent "npm install -g pm2"

echo "4. 重新安装项目依赖..."
aliyun ecs RunCommand \
  --InstanceId $INSTANCE_ID \
  --RegionId $REGION \
  --CommandContent "cd /home/shell && rm -rf node_modules package-lock.json && npm install --production"

echo "5. 构建和启动项目..."
aliyun ecs RunCommand \
  --InstanceId $INSTANCE_ID \
  --RegionId $REGION \
  --CommandContent "cd /home/shell && npm run build && pm2 start npm --name 'chat-app' -- start"

echo "6. 检查服务状态..."
aliyun ecs RunCommand \
  --InstanceId $INSTANCE_ID \
  --RegionId $REGION \
  --CommandContent "pm2 status && netstat -tlnp | grep :3000"

echo "=== 修复完成 ==="
