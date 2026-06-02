#!/data/data/com.termux/files/usr/bin/bash

# WishBridge 后端一键启动脚本
# 使用方法：cd ~/backend && ./start.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT=${PORT:-8080}

echo -e "${GREEN}"
echo "========================================"
echo "  WishBridge Backend - 一键启动"
echo "========================================"
echo -e "${NC}"

echo -e "${YELLOW}[1/3] 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "安装依赖中..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}依赖安装失败！${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}依赖已安装${NC}"
fi

echo -e "\n${YELLOW}[2/3] 启动后端服务...${NC}"
if [ ! -f "src/index.js" ]; then
    echo -e "${RED}找不到入口文件 src/index.js${NC}"
    exit 1
fi

if command -v tmux &> /dev/null; then
    tmux new-session -d -s wishbridge-backend "PORT=$PORT node src/index.js"
    echo -e "${GREEN}后端服务已在 tmux 会话中启动${NC}"
else
    PORT=$PORT nohup node src/index.js > wishbridge-backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > wishbridge-backend.pid
    echo -e "${GREEN}后端服务已启动 (PID: $BACKEND_PID)${NC}"
fi

echo "等待后端启动..."
sleep 3

echo -e "\n${YELLOW}[3/3] 启动 FRP 内网穿透...${NC}"
FRPC_PATH="./ChmlFrp-0.51.2_251023_linux_arm64/frpc"

if [ ! -f "$FRPC_PATH" ]; then
    echo -e "${YELLOW}未找到 FRP 文件，跳过启动${NC}"
    echo -e "${YELLOW}请手动放置 frpc 到: $FRPC_PATH${NC}"
else
    chmod +x "$FRPC_PATH"
    
    if [ ! -f "frpc.ini" ]; then
        echo -e "${RED}找不到 frpc.ini${NC}"
        exit 1
    fi
    
    if command -v tmux &> /dev/null; then
        tmux new-session -d -s wishbridge-frpc "$FRPC_PATH -c $SCRIPT_DIR/frpc.ini"
        echo -e "${GREEN}FRP 已在 tmux 会话中启动${NC}"
    else
        nohup "$FRPC_PATH" -c "$SCRIPT_DIR/frpc.ini" > wishbridge-frpc.log 2>&1 &
        FRPC_PID=$!
        echo $FRPC_PID > wishbridge-frpc.pid
        echo -e "${GREEN}FRP 已启动 (PID: $FRPC_PID)${NC}"
    fi
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}"
echo "  启动完成！"
echo ""
echo "  本地地址: http://127.0.0.1:8080"
echo "  远程地址: http://vip.lsj-2.frp.one:24076"
echo ""
if command -v tmux &> /dev/null; then
    echo "  查看后端: tmux attach -t wishbridge-backend"
    echo "  查看 FRP: tmux attach -t wishbridge-frpc"
else
    echo "  日志文件: wishbridge-backend.log, wishbridge-frpc.log"
    echo "  停止服务: ./stop.sh"
fi
echo -e "${GREEN}========================================${NC}"