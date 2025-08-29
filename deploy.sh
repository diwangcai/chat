#!/bin/bash

# 部署脚本
set -e

echo "🚀 开始部署 Minimalist Chat..."

# 检查环境变量
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  警告: GEMINI_API_KEY 未设置，将使用 FAKE_AI=1 模式"
    export FAKE_AI=1
else
    echo "✅ GEMINI_API_KEY 已设置"
    export FAKE_AI=0
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker compose down --remove-orphans || true

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f || true

# 构建并启动
echo "🔨 构建并启动服务..."
docker compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker compose ps

# 健康检查
echo "🏥 执行健康检查..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ 应用健康检查通过"
        break
    fi
    echo "⏳ 等待应用启动... ($i/30)"
    sleep 2
done

# 检查 Caddy 状态
echo "🌐 检查 Caddy 状态..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Caddy 反向代理正常"
else
    echo "❌ Caddy 反向代理异常"
fi

echo "🎉 部署完成！"
echo "📱 访问地址: http://47.96.78.111"
echo "🔧 管理命令:"
echo "  查看日志: docker compose logs -f"
echo "  重启服务: docker compose restart"
echo "  停止服务: docker compose down"
