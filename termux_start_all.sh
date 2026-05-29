#!/data/data/com.termux/files/usr/bin/bash

# WishBridge 完整一键启动脚本 (Termux版)
# 同时启动后端服务和FRP内网穿透

echo "======================================"
echo "   WishBridge 一键启动 (Termux)"
echo "======================================"
echo ""

PROJECT_DIR="$HOME/wishbridge"
BACKEND_DIR="$PROJECT_DIR/backend"

# 进入项目目录
cd "$PROJECT_DIR"

# 检查文件结构
if [ ! -d "$BACKEND_DIR" ]; then
    echo "错误: 后端目录不存在: $BACKEND_DIR"
    exit 1
fi

if [ ! -f "frpc.ini" ]; then
    echo "警告: frpc.ini 文件未找到"
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "正在安装 Node.js..."
    pkg update -y
    pkg install -y nodejs
fi

# 安装后端依赖
cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    npm install
fi

echo ""
echo "======================================"
echo "   启动 WishBridge 完整服务"
echo "======================================"
echo ""

# 在后台启动后端服务
echo "正在启动后端服务 (端口 8080)..."
cd "$BACKEND_DIR"
node src/index.js > "$PROJECT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "后端服务已启动 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 3

# 启动FRP内网穿透 (如果配置存在)
cd "$PROJECT_DIR"
if [ -f "frpc.ini" ]; then
    if command -v frpc &> /dev/null; then
        echo "正在启动 FRP 内网穿透..."
        frpc -c frpc.ini > "$PROJECT_DIR/frp.log" 2>&1 &
        FRP_PID=$!
        echo "FRP 服务已启动 (PID: $FRP_PID)"
    else
        echo "警告: frpc 未安装，跳过 FRP 启动"
    fi
else
    echo "警告: frpc.ini 不存在，跳过 FRP 启动"
fi

echo ""
echo "======================================"
echo "   服务启动完成！"
echo "======================================"
echo ""
echo "后端地址: http://localhost:8080"
echo "内网穿透: http://jp-2.frp.one:35661"
echo ""
echo "日志文件:"
echo "  - 后端日志: $PROJECT_DIR/backend.log"
echo "  - FRP日志: $PROJECT_DIR/frp.log"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
wait
