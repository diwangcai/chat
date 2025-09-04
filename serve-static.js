const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 获取本机IP地址
const os = require('os');
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const PORT = 8080;
const HOST = '0.0.0.0'; // 监听所有网络接口
const localIP = getLocalIP();

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 默认页面
    if (pathname === '/') {
        pathname = '/network-access.html';
    }
    
    // 构建文件路径
    const filePath = path.join(__dirname, pathname);
    
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件不存在，返回404
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - 页面未找到</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            margin: 0;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                        }
                        h1 { font-size: 3rem; margin-bottom: 20px; }
                        p { font-size: 1.2rem; margin-bottom: 30px; }
                        a { 
                            color: #3b82f6; 
                            text-decoration: none; 
                            padding: 12px 24px;
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 8px;
                            transition: all 0.3s ease;
                        }
                        a:hover { background: rgba(255, 255, 255, 0.3); }
                    </style>
                </head>
                <body>
                    <h1>🚫 404</h1>
                    <p>页面未找到</p>
                    <a href="/">返回首页</a>
                </body>
                </html>
            `);
            return;
        }
        
        // 获取文件扩展名
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>500 - 服务器内部错误</h1>');
                return;
            }
            
            // 设置响应头
            res.writeHead(200, { 
                'Content-Type': contentType + (contentType.startsWith('text/') ? '; charset=utf-8' : ''),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            
            res.end(data);
        });
    });
});

// 启动服务器
server.listen(PORT, HOST, () => {
    console.log('🚀 浮空输入框静态文件服务器已启动');
    console.log('📱 本地访问: http://localhost:' + PORT);
    console.log('🌐 网络访问: http://' + localIP + ':' + PORT);
    console.log('📋 可用页面:');
    console.log('   - 网络访问页面: http://' + localIP + ':' + PORT + '/network-access.html');
    console.log('   - 原型测试页面: http://' + localIP + ':' + PORT + '/test-floating-input.html');
    console.log('   - 集成测试页面: http://' + localIP + ':' + PORT + '/test-floating-input-integration.html');
    console.log('');
    console.log('💡 同网络下的设备可以通过上述IP地址访问测试页面');
    console.log('🔄 按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('❌ 端口 ' + PORT + ' 已被占用，请尝试其他端口');
    } else {
        console.log('❌ 服务器错误:', err.message);
    }
    process.exit(1);
});
