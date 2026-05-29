#!/data/data/com.termux/files/usr/bin/bash

# WishBridge 后端启动脚本 (Termux版)
# 自动安装依赖、配置环境并启动服务

echo "======================================"
echo "   WishBridge 后端启动脚本 (Termux)"
echo "======================================"
echo ""

# 设置项目目录
PROJECT_DIR="$HOME/wishbridge/backend"
FRPC_DIR="$HOME/wishbridge"

# 检查目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录不存在: $PROJECT_DIR"
    echo "请确保已将文件复制到正确位置"
    exit 1
fi

cd "$PROJECT_DIR"

# 检查并安装 Node.js
if ! command -v node &> /dev/null; then
    echo "正在安装 Node.js 和 npm..."
    pkg update -y
    pkg install -y nodejs
fi

# 检查 Node.js 版本
echo "Node.js 版本:"
node --version

# 检查并安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装项目依赖..."
    npm install
fi

# 复制 frpc.ini 到正确位置
if [ -f "$FRPC_DIR/frpc.ini" ]; then
    echo "已找到 frpc.ini 配置文件"
else
    echo "警告: frpc.ini 文件未找到"
fi

echo ""
echo "======================================"
echo "   启动 WishBridge 后端服务..."
echo "======================================"
echo ""

# 启动后端服务
cd "$PROJECT_DIR"
node src/index.js
