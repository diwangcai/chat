@echo off
echo 正在配置域名 diwangcai.com...

echo 1. 上传Caddyfile配置...
scp Caddyfile.new root@47.96.78.111:/opt/chatapp/Caddyfile

echo 2. 启动Caddy服务...
ssh -o StrictHostKeyChecking=no root@47.96.78.111 "cd /opt/chatapp && nohup caddy run --config Caddyfile > caddy.log 2>&1 &"

echo 3. 检查服务状态...
ssh -o StrictHostKeyChecking=no root@47.96.78.111 "sleep 3 && netstat -tlnp | grep :80"

echo 4. 测试域名访问...
curl -I http://diwangcai.com

echo 配置完成！
pause
