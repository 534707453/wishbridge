# WishBridge 产品需求文档

## 1. 产品概述

**产品名称：** WishBridge（心愿桥）

**产品类型：** 情侣心愿传递即时通讯应用

**核心价值：** 为情侣提供专属的心愿表达、心情同步、愿望管理的一站式平台，增强情侣间的情感交流与互动体验。

**目标用户：** 热恋期情侣，尤其是异地恋情侣

---

## 2. 用户体系

### 2.1 用户角色

| 角色 | 描述 | 主要功能 |
|------|------|----------|
| 女友端 | 发起愿望、分享心情 | 发送愿望、设置心情、同愿望管理 |
| 男友端 | 接收愿望、管理愿望 | 查看愿望、标记实现、申请修改、心情查看 |

### 2.2 用户注册与登录

- **注册流程：**
  - 输入用户名（唯一标识）
  - 设置密码
  - 选择性别（男/女）
  - 设置配对码（用于建立情侣关系）
  - 完成注册后，通过配对码建立情侣绑定关系

- **登录功能：**
  - 用户名 + 密码登录
  - 自动记住登录状态
  - 密码修改功能

- **账号设置：**
  - 修改密码
  - 退出登录
  - 查看绑定状态

---

## 3. 功能需求

### 3.1 女友端功能

#### 3.1.1 发送愿望
- **功能描述：** 女友可以向男友发送文字愿望信息
- **输入框：** 多行文本输入，支持最多500字
- **发送按钮：** 点击发送愿望到服务器
- **反馈：** 发送成功/失败提示
- **时间戳：** 显示发送时间

#### 3.1.2 心情状态
- **功能描述：** 展示并同步当前心情给男友
- **心情选项：**
  - 😊 开心
  - 😢 难过
  - 😡 生气
  - 😴 疲惫
  - 🤔 思考
  - 🥰 甜蜜
  - 😰 焦虑
  - 🤔 其他
- **心情描述：** 可选添加心情备注（最多50字）
- **同步机制：** 心情变更实时同步到男友端

#### 3.1.3 愿望管理
- **愿望列表：** 展示所有发送的愿望
- **状态显示：**
  - ⏳ 待实现（默认状态）
  - ✅ 已实现
- **愿望操作：**
  - 查看愿望详情
  - 删除愿望
  - 收到修改申请时决定是否同意

#### 3.1.4 修改申请处理
- **功能描述：** 男友可申请修改愿望，女友审核
- **收到申请：** 男友发送修改理由
- **女友操作：** 同意 / 拒绝
- **通知：** 申请结果通知男友

### 3.2 男友端功能

#### 3.2.1 查看愿望
- **愿望列表：** 展示女友发送的所有愿望
- **愿望卡片：** 显示愿望内容、发送时间、状态
- **愿望详情：** 点击查看完整愿望

#### 3.2.2 愿望状态管理
- **标记实现：** 一键标记愿望为"已实现"
- **批量管理：** 可批量操作愿望状态
- **历史记录：** 查看已实现愿望列表

#### 3.2.3 申请修改愿望
- **功能描述：** 对某个愿望申请修改
- **申请理由：** 必填，描述修改原因（最多200字）
- **等待审核：** 申请后等待女友同意

#### 3.2.4 查看心情
- **实时同步：** 显示女友当前心情状态
- **心情提醒：** 心情变化时显示通知

### 3.3 通用功能

#### 3.3.1 通知提醒
- **新愿望通知：** 收到新愿望时弹出系统通知
- **愿望实现通知：** 男友实现愿望时通知女友
- **修改申请通知：** 收到修改申请时通知女友
- **心情变化通知：** 女友心情变化时通知男友

#### 3.3.2 离线消息缓存
- **缓存机制：** 对方离线时消息存储在服务器
- **自动送达：** 对方上线后自动推送离线消息
- **消息状态：** 区分已读/未读状态

#### 3.3.3 实时通信
- **WebSocket：** 实时双向通信
- **心跳检测：** 定期检测连接状态
- **重连机制：** 网络断开后自动重连

---

## 4. UI/UX 设计规范

### 4.1 设计理念
- **简约温馨：** 简洁界面设计，营造温馨浪漫氛围
- **甜蜜配色：** 柔和的粉色、紫色渐变主色调
- **卡片式布局：** 清晰的信息层级，易于阅读
- **流畅动效：** 自然的过渡动画，提升交互体验

### 4.2 色彩规范

#### 女友端配色
```
主色调：#FF6B9D（玫瑰粉）
次要色：#C44569（深玫红）
强调色：#FF8FB1（浅粉）
背景色：#FFF5F8（淡粉白）
文字色：#2D3436（深灰）
```

#### 男友端配色
```
主色调：#6C5CE7（梦幻紫）
次要色：#A29BFE（淡紫）
强调色：#DFE6E9（银灰）
背景色：#F8F9FF（淡紫白）
文字色：#2D3436（深灰）
```

### 4.3 字体规范
- **标题字体：** 思源黑体 Bold / Noto Sans SC Bold
- **正文字体：** 思源黑体 Regular / Noto Sans SC Regular
- **字号规范：**
  - 大标题：24px
  - 副标题：18px
  - 正文：16px
  - 辅助文字：14px
  - 最小文字：12px

### 4.4 界面布局

#### 4.4.1 登录/注册页面
- Logo居中显示
- 表单简洁对齐
- 按钮醒目
- 背景渐变+装饰元素

#### 4.4.2 主页布局（底部导航）
- **女友端：** 愿望列表 | 发送愿望 | 心情 | 我的
- **男友端：** 愿望列表 | 心情 | 我的

#### 4.4.3 愿望卡片设计
- 圆角卡片（12px圆角）
- 阴影效果
- 状态标签（待实现/已实现）
- 时间显示
- 操作按钮

### 4.5 动效规范
- 页面切换：淡入淡出（300ms）
- 按钮点击：缩放反馈（0.95，150ms）
- 列表加载：依次淡入（stagger 50ms）
- 消息发送：滑入动画（200ms）
- 状态变更：颜色过渡（200ms）

---

## 5. 技术架构

### 5.1 整体架构

```
┌─────────────────────────────────────────┐
│            Android/iOS APP              │
│         (Capacitor + Vue 3)            │
├─────────────────────────────────────────┤
│              API 网关                   │
│          (jp-2.frp.one:35661)           │
├─────────────────────────────────────────┤
│           Node.js 后端服务              │
│        (Express + Socket.io)            │
├─────────────────────────────────────────┤
│            SQLite 数据库                │
│          (better-sqlite3)               │
└─────────────────────────────────────────┘
```

### 5.2 前端技术栈
- **框架：** Vue 3 + Composition API
- **构建工具：** Vite
- **移动框架：** Capacitor（打包APK）
- **状态管理：** Pinia
- **路由：** Vue Router
- **样式：** CSS3 + CSS Variables
- **图标：** Lucide Icons
- **HTTP库：** Axios
- **WebSocket：** Socket.io-client

### 5.3 后端技术栈
- **运行环境：** Node.js 18+
- **框架：** Express.js
- **WebSocket：** Socket.io
- **数据库：** SQLite（better-sqlite3）
- **认证：** JWT
- **密码加密：** bcrypt

### 5.4 数据持久化

#### 5.4.1 数据库表结构

**users 表**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
  pair_code TEXT UNIQUE,
  partner_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES users(id)
);
```

**wishes 表**
```sql
CREATE TABLE wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'realized')) DEFAULT 'pending',
  modify_request TEXT,
  modify_status TEXT CHECK(modify_status IN ('none', 'pending', 'accepted', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

**moods 表**
```sql
CREATE TABLE moods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  mood TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**messages_cache 表（离线消息缓存）**
```sql
CREATE TABLE messages_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
);
```

---

## 6. API 接口设计

### 6.1 REST API

#### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| PUT | /api/auth/password | 修改密码 |
| GET | /api/auth/me | 获取当前用户信息 |

#### 配对接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/pair/bind | 绑定配对码 |
| DELETE | /api/pair/unbind | 解除绑定 |
| GET | /api/pair/status | 获取绑定状态 |

#### 愿望接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/wishes | 获取愿望列表 |
| POST | /api/wishes | 发送愿望 |
| PUT | /api/wishes/:id/status | 更新愿望状态 |
| PUT | /api/wishes/:id/modify | 申请修改愿望 |
| PUT | /api/wishes/:id/modify/respond | 响应修改申请 |
| DELETE | /api/wishes/:id | 删除愿望 |

#### 心情接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/moods/current | 获取当前心情 |
| POST | /api/moods | 更新心情 |
| GET | /api/moods/history | 获取心情历史 |

#### 离线消息接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/messages/cached | 获取离线消息 |
| PUT | /api/messages/:id/read | 标记消息已读 |

### 6.2 WebSocket 事件

#### 客户端发送
| 事件名 | 描述 |
|--------|------|
| auth | 用户认证 |
| send_wish | 发送愿望 |
| update_wish_status | 更新愿望状态 |
| send_modify_request | 发送修改申请 |
| respond_modify | 响应修改申请 |
| update_mood | 更新心情 |
| read_message | 标记消息已读 |

#### 服务器推送
| 事件名 | 描述 |
|--------|------|
| wish_received | 收到新愿望 |
| wish_updated | 愿望状态更新 |
| modify_request | 收到修改申请 |
| modify_response | 修改申请响应 |
| mood_updated | 心情更新 |
| message_cached | 离线消息推送 |
| notification | 系统通知 |

---

## 7. 部署方案

### 7.1 Termux 后端部署

```bash
# 安装 Node.js
pkg install nodejs

# 安装 PostgreSQL/SQLite
pkg install sqlite

# 创建项目目录
mkdir -p ~/wishbridge
cd ~/wishbridge

# 初始化项目
npm init -y

# 安装依赖
npm install express socket.io better-sqlite3 bcrypt jsonwebtoken cors dotenv

# 配置 frpc.ini
# 配置后端服务端口为 8080
```

### 7.2 ChmlFrp 内网穿透配置

**frpc.ini 配置：**
```ini
[common]
server_addr = 74.113.96.215
server_port = 7000
tls_enable = false
user = aY2RZNYz2ZIhobun0aB7TLeb
token = ChmlFrpToken

[wishbridge]
type = tcp
local_ip = 127.0.0.1
local_port = 8080
remote_port = 35661
```

**连接地址：** `jp-2.frp.one:35661`

### 7.3 APK 构建

使用 Capacitor 将 Vue 3 前端应用打包为 Android APK：
- 前端请求后端地址：`http://jp-2.frp.one:35661`
- 后端 API 地址：`http://jp-2.frp.one:35661`

---

## 8. 通知系统

### 8.1 通知类型
1. **新愿望通知** - 当女友发送新愿望时
2. **愿望实现通知** - 当男友标记愿望为已实现时
3. **修改申请通知** - 当男友申请修改愿望时
4. **申请结果通知** - 当女友响应修改申请时
5. **心情变化通知** - 当女友心情发生变化时

### 8.2 实现方式
- **APP内通知：** 使用 Vue 的响应式系统 + Socket.io 实时推送
- **系统通知：** 使用 Capacitor 的 Notification 插件
- **离线消息：** 存储在数据库，上线后自动推送

---

## 9. 项目文件结构

```
wishbridge/
├── backend/                    # 后端目录（Termux运行）
│   ├── src/
│   │   ├── index.js           # 主入口
│   │   ├── database.js        # 数据库初始化
│   │   ├── routes/            # 路由
│   │   │   ├── auth.js
│   │   │   ├── wishes.js
│   │   │   ├── moods.js
│   │   │   └── pair.js
│   │   ├── middleware/        # 中间件
│   │   │   └── auth.js
│   │   └── socket/            # WebSocket处理
│   │       └── handler.js
│   ├── package.json
│   └── frpc.ini              # 内网穿透配置
│
├── frontend/                   # 前端目录
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── router/
│   │   ├── views/
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── Home.vue
│   │   │   ├── Wishes.vue
│   │   │   ├── SendWish.vue
│   │   │   ├── Mood.vue
│   │   │   └── Profile.vue
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── capacitor.config.json      # Capacitor配置
```

---

## 10. 验收标准

### 10.1 功能验收
- [ ] 用户可以注册账号（男/女角色）
- [ ] 用户可以登录/登出
- [ ] 用户可以修改密码
- [ ] 女友可以发送愿望
- [ ] 男友可以查看愿望列表
- [ ] 男友可以标记愿望为已实现
- [ ] 男友可以申请修改愿望
- [ ] 女友可以响应修改申请
- [ ] 女友可以设置心情
- [ ] 男友可以查看女友心情
- [ ] 实时推送功能正常
- [ ] 离线消息缓存正常
- [ ] 系统通知正常

### 10.2 UI验收
- [ ] 界面简约美观
- [ ] 男友端/女友端UI区分明显
- [ ] 动画效果流畅
- [ ] 响应式布局正常

### 10.3 技术验收
- [ ] 后端可在Termux运行
- [ ] APK可正常安装
- [ ] ChmlFrp内网穿透正常
- [ ] 数据库持久化正常
