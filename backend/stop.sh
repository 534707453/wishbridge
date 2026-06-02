#!/data/data/com.termux/files/usr/bin/bash

# WishBridge 后端停止脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}正在停止 WishBridge...${NC}"

if command -v tmux &> /dev/null; then
    tmux kill-session -t wishbridge-backend 2>/dev/null && echo -e "${GREEN}后端已停止${NC}"
    tmux kill-session -t wishbridge-frpc 2>/dev/null && echo -e "${GREEN}FRP 已停止${NC}"
fi

if [ -f "wishbridge-backend.pid" ]; then
    kill $(cat wishbridge-backend.pid) 2>/dev/null && echo -e "${GREEN}后端已停止${NC}"
    rm -f wishbridge-backend.pid
fi

if [ -f "wishbridge-frpc.pid" ]; then
    kill $(cat wishbridge-frpc.pid) 2>/dev/null && echo -e "${GREEN}FRP 已停止${NC}"
    rm -f wishbridge-frpc.pid
fi

pkill -f "node src/index.js" 2>/dev/null
pkill -f "frpc" 2>/dev/null

echo -e "${GREEN}全部服务已停止${NC}"