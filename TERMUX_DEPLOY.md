# WishBridge Termux 部署指南

## 前置准备

### 1. Termux 安装软件
```bash
pkg update && pkg upgrade
pkg install nodejs npm
pkg install git  # 可选，用于克隆代码
pkg install tmux # 可选，推荐，方便管理后台服务
```

### 2. 上传项目文件到手机
将以下文件/目录上传到 Termux 根目录（`~/wishbridge`）：
- `backend/` 目录
- `frpc.ini` 文件
- `start-wishbridge.sh`
- `stop-wishbridge.sh`

上传方式：
1. 使用手机文件管理器，将文件移动到 `/storage/emulated/0/`
2. 在 Termux 中：
```bash
termux-setup-storage
mkdir -p ~/wishbridge
cp /storage/emulated/0/wishbridge/* ~/wishbridge/
```

### 3. 文件权限设置
```bash
cd ~/wishbridge
chmod +x backend/ChmlFrp-0.51.2_251023_linux_arm64/frpc
chmod +x start-wishbridge.sh
chmod +x stop-wishbridge.sh
```

## 启动服务

### 一键启动
```bash
cd ~/wishbridge
./start-wishbridge.sh
```

启动后：
- 后端服务运行在 `http://127.0.0.1:8080`
- FRP 内网穿透自动启动
- 远程访问地址：`http://vip.lsj-2.frp.one:24076`

### 查看服务状态

#### 如果使用 tmux（推荐）
```bash
# 查看后端服务
tmux attach -t wishbridge-backend
# 按 Ctrl+B，然后按 D 退出

# 查看 FRP 服务
tmux attach -t wishbridge-frpc
```

#### 如果使用 nohup
```bash
# 查看后端日志
tail -f wishbridge-backend.log

# 查看 FRP 日志
tail -f wishbridge-frpc.log
```

## 停止服务

```bash
cd ~/wishbridge
./stop-wishbridge.sh
```

## 测试服务

### 本地测试
```bash
curl http://127.0.0.1:8080/api/health
```

### 远程测试
用手机浏览器或电脑访问：
`http://vip.lsj-2.frp.one:24076/api/health`

## 目录结构
```
~/wishbridge/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── node_modules/    # npm install 后生成
│   └── package.json
├── ChmlFrp-0.51.2_251023_linux_arm64/
│   └── frpc
├── frpc.ini
├── start-wishbridge.sh
├── stop-wishbridge.sh
├── wishbridge-backend.log  # 运行后生成
└── wishbridge-frpc.log     # 运行后生成
```

## 常见问题

### Q: 提示权限不足？
```bash
chmod +x start-wishbridge.sh stop-wishbridge.sh
```

### Q: 找不到 frpc 文件？
确认 FRP 路径是否正确，检查：
```bash
ls -la backend/ChmlFrp-0.51.2_251023_linux_arm64/
```

### Q: npm install 很慢？
使用国内镜像：
```bash
cd backend
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: 如何让服务在后台一直运行？
- 使用 tmux 会话（推荐）
- 或者使用 nohup（脚本已支持）
- 保持 Termux 应用在后台运行，不要被系统杀死

### Q: FRP 连接失败？
检查：
1. 网络连接
2. `frpc.ini` 配置是否正确
3. 查看 FRP 日志

## 配置前端 APK

在 APK 配置中，API 地址已设置为：
```
http://vip.lsj-2.frp.one:24076
```

## 一键启动脚本说明

`start-wishbridge.sh` 脚本会自动完成：
1. 检查并安装后端依赖（如未安装）
2. 启动后端服务（使用 tmux 或 nohup）
3. 启动 FRP 内网穿透
4. 显示服务状态和访问地址

## 安卓 APK 安装

APK 文件位置：`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

安装方式：
1. 将 APK 文件复制到手机存储
2. 使用文件管理器打开 APK 文件进行安装
3. 允许"未知来源"安装权限

安装后打开 App，会自动连接到 `vip.lsj-2.frp.one:24076`