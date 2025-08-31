#!/bin/bash

echo "=== 服务器磁盘清理脚本 ==="

echo "1. 检查磁盘使用情况..."
df -h

echo -e "\n2. 清理npm缓存..."
npm cache clean --force

echo -e "\n3. 清理系统缓存..."
sudo apt-get clean
sudo apt-get autoremove -y

echo -e "\n4. 清理日志文件..."
sudo journalctl --vacuum-time=7d

echo -e "\n5. 清理临时文件..."
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

echo -e "\n6. 清理旧的node_modules..."
cd /home/shell
rm -rf node_modules package-lock.json

echo -e "\n7. 查找大文件..."
echo "最大的10个文件："
sudo find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -10

echo -e "\n8. 检查/home目录大小..."
du -sh /home/*

echo -e "\n9. 清理完成后检查磁盘..."
df -h

echo -e "\n=== 清理完成 ==="
echo "现在可以尝试重新安装依赖："
echo "cd /home/shell"
echo "npm install --production"
