#!/data/data/com.termux/files/usr/bin/bash

# WishBridge FRP 内网穿透启动脚本 (Termux版)

echo "======================================"
echo "   WishBridge FRP 内网穿透启动"
echo "======================================"
echo ""

PROJECT_DIR="$HOME/wishbridge"
cd "$PROJECT_DIR"

# 检查 frpc.ini 是否存在
if [ ! -f "frpc.ini" ]; then
    echo "错误: frpc.ini 配置文件不存在"
    exit 1
fi

echo "正在启动 FRP 客户端..."
echo "配置文件: frpc.ini"
echo ""

# 启动 frpc (假设 frpc 已安装或在 PATH 中)
if command -v frpc &> /dev/null; then
    frpc -c frpc.ini
else
    echo "错误: frpc 命令未找到"
    echo "请先安装 FRP 客户端"
    echo "可以从 https://github.com/fatedier/frp/releases 下载"
    exit 1
fi
