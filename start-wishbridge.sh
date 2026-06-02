#!/data/data/com.termux/files/usr/bin/bash

# WishBridge Termux 一键启动脚本
# 适用于 Android Termux 环境

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 设置默认端口
PORT=${PORT:-8080}

# 打印标题
echo -e "${GREEN}"
echo "========================================"
echo "  WishBridge - 一键启动 (Termux)"
echo "========================================"
echo -e "${NC}"
echo "使用端口: $PORT"
echo ""

# [1/3] 检查后端依赖
echo -e "${YELLOW}[1/3] 检查后端依赖...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo "正在安装后端依赖..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}依赖安装失败！${NC}"
        exit 1
    fi
    cd ..
else
    echo -e "${GREEN}后端依赖已安装${NC}"
fi

# [2/3] 启动后端服务
echo ""
echo -e "${YELLOW}[2/3] 启动后端服务...${NC}"
cd backend
if [ ! -f "src/index.js" ]; then
    echo -e "${RED}找不到后端入口文件 src/index.js${NC}"
    exit 1
fi

# 后台启动后端（使用 tmux 或 nohup）
if command -v tmux &> /dev/null; then
    tmux new-session -d -s wishbridge-backend "PORT=$PORT node src/index.js"
    echo -e "${GREEN}后端服务已在 tmux 会话中启动${NC}"
else
    PORT=$PORT nohup node src/index.js > ../wishbridge-backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../wishbridge-backend.pid
    echo -e "${GREEN}后端服务已启动 (PID: $BACKEND_PID)${NC}"
fi
cd ..

# 等待后端启动
echo "等待后端启动..."
sleep 3

# [3/3] 启动 FRP 内网穿透
echo ""
echo -e "${YELLOW}[3/3] 启动 FRP 内网穿透...${NC}"

# 检查 FRP 文件
FRPC_DIR="backend/ChmlFrp-0.51.2_251023_linux_arm64"
FRPC_PATH="$FRPC_DIR/frpc"

if [ ! -f "$FRPC_PATH" ]; then
    echo -e "${RED}找不到 FRP 文件: $FRPC_PATH${NC}"
    echo -e "${YELLOW}请检查文件路径是否正确${NC}"
    echo "正在查找 frpc..."
    find . -name "frpc" -type f 2>/dev/null | head -5
else
    chmod +x "$FRPC_PATH"
    
    if [ ! -f "frpc.ini" ]; then
        echo -e "${RED}找不到 frpc.ini 配置文件${NC}"
        exit 1
    fi
    
    # 启动 FRP
    if command -v tmux &> /dev/null; then
        tmux new-session -d -s wishbridge-frpc "$FRPC_PATH -c $SCRIPT_DIR/frpc.ini"
        echo -e "${GREEN}FRP 服务已在 tmux 会话中启动${NC}"
    else
        nohup "$FRPC_PATH" -c "$SCRIPT_DIR/frpc.ini" > wishbridge-frpc.log 2>&1 &
        FRPC_PID=$!
        echo $FRPC_PID > wishbridge-frpc.pid
        echo -e "${GREEN}FRP 服务已启动 (PID: $FRPC_PID)${NC}"
    fi
fi

# 完成信息
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}"
echo "  WishBridge 启动完成！"
echo ""
echo "  后端地址: http://127.0.0.1:8080"
echo "  远程地址: http://vip.lsj-2.frp.one:24076"
echo "  健康检查: http://127.0.0.1:8080/api/health"
echo ""
if command -v tmux &> /dev/null; then
    echo "  查看服务: tmux attach -t wishbridge-backend"
    echo "  查看 FRP: tmux attach -t wishbridge-frpc"
else
    echo "  日志文件: wishbridge-backend.log, wishbridge-frpc.log"
    echo "  停止服务: ./stop-wishbridge.sh"
fi
echo ""
echo -e "${GREEN}========================================${NC}"