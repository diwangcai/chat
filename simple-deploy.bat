@echo off
echo 正在配置域名 diwangcai.com...

REM 创建SSH配置文件
echo Host 47.96.78.111 > ssh_config
echo     HostName 47.96.78.111 >> ssh_config
echo     User root >> ssh_config
echo     StrictHostKeyChecking no >> ssh_config
echo     PasswordAuthentication yes >> ssh_config

REM 执行SSH命令
echo 执行配置命令...
ssh -F ssh_config 47.96.78.111 "cd /opt/chatapp && echo 'diwangcai.com { reverse_proxy localhost:3000 }' > Caddyfile"

echo 启动Caddy服务...
ssh -F ssh_config 47.96.78.111 "cd /opt/chatapp && pkill caddy 2>/dev/null; nohup caddy run --config Caddyfile > caddy.log 2>&1 &"

echo 等待服务启动...
timeout /t 5 /nobreak > nul

echo 检查服务状态...
ssh -F ssh_config 47.96.78.111 "netstat -tlnp | grep :80"

echo 测试域名访问...
curl -I http://diwangcai.com

echo 清理临时文件...
del ssh_config

echo 配置完成！
pause
