# WishBridge 发布版本说明

## 📦 文件说明

### Android APP
- `WishBridge.apk` - Android 应用安装包

### 后端服务
- `backend/` - 后端服务代码
  - `src/` - 源代码
  - `package.json` - 依赖配置
  - `data/` - 数据库目录 (运行时自动创建)
  - `logs/` - 日志目录 (运行时自动创建)

### Termux 脚本
- `termux_start.sh` - 仅启动后端服务
- `termux_frp_start.sh` - 仅启动FRP内网穿透
- `termux_start_all.sh` - 一键启动后端+FRP
- `frpc.ini` - FRP内网穿透配置文件

---

## 📱 Android APP 安装

1. 将 `WishBridge.apk` 复制到手机
2. 在手机上点击安装
3. 允许安装未知来源应用（如需要）
4. 安装完成后打开应用

APP已配置为连接内网穿透地址：`http://jp-2.frp.one:35661`

---

## 🚀 Termux 后端部署

### 前置准备
1. 在Android手机上安装 Termux 应用
2. 打开 Termux，执行以下命令准备环境：

```bash
# 更新包管理器
pkg update -y
pkg upgrade -y

# 安装必要工具
pkg install -y nodejs wget
```

### 部署步骤
1. 将整个 `wishbridge` 文件夹复制到 Termux 的 `$HOME/` 目录：
   - 路径应为：`/data/data/com.termux/files/home/wishbridge/`

2. 在 Termux 中设置脚本执行权限：
```bash
cd ~/wishbridge
chmod +x *.sh
```

3. 安装 FRP 客户端 (可选，用于内网穿透)：
```bash
# 下载 FRP (根据手机架构选择，通常是 arm64)
wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_linux_arm64.tar.gz
tar -xzf frp_0.52.3_linux_arm64.tar.gz
cd frp_0.52.3_linux_arm64
cp frpc /data/data/com.termux/files/usr/bin/
chmod +x /data/data/com.termux/files/usr/bin/frpc
```

### 启动方式

#### 方式1：一键启动 (推荐)
```bash
cd ~/wishbridge
./termux_start_all.sh
```

#### 方式2：分别启动
终端1 - 启动后端：
```bash
cd ~/wishbridge
./termux_start.sh
```

终端2 - 启动FRP (需要另开一个Termux会话)：
```bash
cd ~/wishbridge
./termux_frp_start.sh
```

---

## 🌐 访问地址

- **本地访问 (仅Termux本机)**: http://localhost:8080
- **内网穿透访问**: http://jp-2.frp.one:35661

---

## 📝 FRP 配置说明

`frpc.ini` 已配置好：
- 服务器: `74.113.96.215:7000`
- 本地端口: `8080`
- 远程端口: `35661`

---

## 🔧 故障排查

### 后端无法启动
```bash
# 检查 Node.js 版本
node --version

# 重新安装依赖
cd ~/wishbridge/backend
rm -rf node_modules
npm install
```

### FRP 连接失败
- 检查网络连接
- 确认 `frpc` 已正确安装
- 查看 `frp.log` 日志文件

### APP 无法连接
- 确认后端服务正在运行
- 确认FRP内网穿透已连接
- 检查手机网络连接

---

## 📄 日志文件

服务运行时会生成以下日志：
- `backend.log` - 后端服务日志
- `frp.log` - FRP 内网穿透日志
- `backend/logs/` - 后端详细日志目录

---

## 🎉 开始使用

1. 在Termux启动后端和FRP
2. 在手机安装并打开 WishBridge APP
3. 注册账号，配对使用！
