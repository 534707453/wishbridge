#!/data/data/com.termux/files/usr/bin/bash

# WishBridge Termux 停止脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}正在停止 WishBridge 服务...${NC}"

# 使用 tmux 停止
if command -v tmux &> /dev/null; then
    tmux kill-session -t wishbridge-backend 2>/dev/null && echo -e "${GREEN}后端 tmux 会话已停止${NC}"
    tmux kill-session -t wishbridge-frpc 2>/dev/null && echo -e "${GREEN}FRP tmux 会话已停止${NC}"
fi

# 使用 PID 文件停止
if [ -f "wishbridge-backend.pid" ]; then
    BACKEND_PID=$(cat wishbridge-backend.pid 2>/dev/null)
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}后端进程已停止 (PID: $BACKEND_PID)${NC}"
    fi
    rm -f wishbridge-backend.pid
fi

if [ -f "wishbridge-frpc.pid" ]; then
    FRPC_PID=$(cat wishbridge-frpc.pid 2>/dev/null)
    if [ -n "$FRPC_PID" ]; then
        kill $FRPC_PID 2>/dev/null && echo -e "${GREEN}FRP 进程已停止 (PID: $FRPC_PID)${NC}"
    fi
    rm -f wishbridge-frpc.pid
fi

# 清理残留进程
pkill -f "node src/index.js" 2>/dev/null
pkill -f "frpc" 2>/dev/null

echo -e "${GREEN}WishBridge 服务已全部停止${NC}"
