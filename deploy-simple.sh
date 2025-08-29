#!/bin/bash

# 简化部署脚本 - 不使用 Docker Compose
set -e

echo "🚀 开始简化部署 Minimalist Chat..."

# 检查环境变量
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  警告: GEMINI_API_KEY 未设置，将使用 FAKE_AI=1 模式"
    export FAKE_AI=1
else
    echo "✅ GEMINI_API_KEY 已设置"
    export FAKE_AI=0
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 Node.js"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm ci --only=production --omit=dev

# 构建应用
echo "🔨 构建应用..."
npm run build

# 创建 systemd 服务文件
echo "🔧 创建 systemd 服务..."
cat > /etc/systemd/system/minimalist-chat.service << EOF
[Unit]
Description=Minimalist Chat Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=FAKE_AI=${FAKE_AI}
Environment=GEMINI_API_KEY=${GEMINI_API_KEY}
Environment=GEMINI_MODEL=gemini-2.5-flash
Environment=NEXT_TELEMETRY_DISABLED=1
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启用并启动服务
echo "🚀 启动服务..."
systemctl enable minimalist-chat
systemctl start minimalist-chat

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
systemctl status minimalist-chat

# 健康检查
echo "🏥 执行健康检查..."
for i in {1..30}; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ 应用健康检查通过"
        break
    fi
    echo "⏳ 等待应用启动... ($i/30)"
    sleep 2
done

echo "🎉 部署完成！"
echo "📱 访问地址: http://47.96.78.111:3001"
echo "🔧 管理命令:"
echo "  查看状态: systemctl status minimalist-chat"
echo "  查看日志: journalctl -u minimalist-chat -f"
echo "  重启服务: systemctl restart minimalist-chat"
echo "  停止服务: systemctl stop minimalist-chat"
