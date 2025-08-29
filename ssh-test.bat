@echo off
echo 测试SSH连接...
echo.
echo 尝试连接: ssh root@47.96.78.111
echo 密码: ZZa386920091
echo.
echo 如果连接成功，请执行以下命令:
echo cd /opt/chatapp
echo echo "diwangcai.com { reverse_proxy localhost:3000 }" ^> Caddyfile
echo pkill caddy 2^>/dev/null
echo nohup caddy run --config Caddyfile ^> caddy.log 2^>^&1 ^&
echo.
pause
