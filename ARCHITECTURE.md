# WishBridge 技术架构文档

## 1. 系统架构概述

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Android/iOS 设备                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Capacitor WebView                     │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │                   Vue 3 SPA                         ││    │
│  │  │  ┌───────────┐  ┌───────────┐  ┌─────────────────┐││    │
│  │  │  │   Views   │  │  Stores   │  │    Services      │││    │
│  │  │  │           │  │  (Pinia)  │  │ (API/Socket.io) │││    │
│  │  │  └───────────┘  └───────────┘  └─────────────────┘││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                         HTTP/WebSocket                           │
└──────────────────────────────│──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   ChmlFrp 穿透服务   │
                    │  jp-2.frp.one:35661 │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────│──────────────────────────────────┐
│                         Termux 环境                               │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                      Node.js 服务                          │  │
│  │  ┌─────────────────┐          ┌─────────────────────────┐ │  │
│  │  │   Express API    │          │   Socket.io Server       │ │  │
│  │  │  (REST Endpoints) │          │   (实时通信)              │ │  │
│  │  └────────┬─────────┘          └────────────┬────────────┘ │  │
│  │           │                                  │            │  │
│  │  ┌────────┴─────────────────────────────────┴─────────┐  │  │
│  │  │                  Service Layer                     │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │  │  │
│  │  │  │ AuthService │ │ WishService │ │ MoodService │   │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                            │                              │  │
│  │  ┌─────────────────────────┴─────────────────────────┐  │  │
│  │  │                 Data Access Layer                   │  │  │
│  │  │                   SQLite (better-sqlite3)           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术选型理由

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| 前端框架 | Vue 3 | 轻量级、响应式、Composition API |
| 移动打包 | Capacitor | 一次编写，多平台打包（Android/iOS） |
| 后端框架 | Express.js | 简洁、灵活、丰富的中间件生态 |
| 实时通信 | Socket.io | 自动重连、房间管理、事件驱动 |
| 数据库 | SQLite | 零配置、高性能、适合单租户场景 |
| ORM | better-sqlite3 | 同步API、性能优秀、类型安全 |
| 认证 | JWT | 无状态、可扩展、跨域友好 |
| 密码加密 | bcrypt | 专为密码设计的哈希算法 |

---

## 2. 数据库设计

### 2.1 ER 图

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    wishes    │       │    moods     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │    ┌──│ id (PK)      │
│ username     │  │    │ sender_id(FK)│    │  │ user_id (FK) │
│ password     │  └───►│ receiver_id  │◄───┘  │ mood         │
│ gender       │       │ content     │       │ note         │
│ pair_code    │       │ status      │       │ created_at   │
│ partner_id   │◄──┐   │ modify_req  │       └──────────────┘
│ created_at   │  │   │ modify_stat │       
└──────────────┘  │   │ created_at  │       
                   │   │ updated_at  │       
                   │   └──────────────┘       
                   │            │
                   │   ┌────────┴────────┐
                   └──►│ messages_cache │
                       ├────────────────┤
                       │ id (PK)        │
                       │ from_user_id   │
                       │ to_user_id     │
                       │ type           │
                       │ content        │
                       │ is_read        │
                       │ created_at     │
                       └────────────────┘
```

### 2.2 索引设计

```sql
-- 用户名唯一索引
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 配对码唯一索引
CREATE UNIQUE INDEX idx_users_pair_code ON users(pair_code);

-- 愿望查询优化索引
CREATE INDEX idx_wishes_sender ON wishes(sender_id);
CREATE INDEX idx_wishes_receiver ON wishes(receiver_id);
CREATE INDEX idx_wishes_status ON wishes(status);

-- 心情查询优化索引
CREATE INDEX idx_moods_user ON moods(user_id);

-- 离线消息查询索引
CREATE INDEX idx_messages_to_user ON messages_cache(to_user_id);
CREATE INDEX idx_messages_unread ON messages_cache(to_user_id, is_read);
```

### 2.3 数据关系

1. **情侣关系 (1:1)**
   - `users.partner_id` 指向另一个用户
   - 配对码用于建立关系

2. **愿望关系 (N:1)**
   - 每条愿望属于一个发送者和一个接收者
   - 发送者和接收者必须是情侣

3. **心情关系 (N:1)**
   - 每个用户可以有多条心情记录
   - 只保留最近一条作为当前心情

4. **消息缓存关系 (N:1)**
   - 每条缓存消息指向一个目标用户
   - 消息被读取后标记 is_read=1

---

## 3. API 接口设计

### 3.1 认证接口

#### POST /api/auth/register
**请求体：**
```json
{
  "username": "string",
  "password": "string",
  "gender": "male" | "female",
  "pair_code": "string"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "alice",
      "gender": "female",
      "pair_code": "ABCD1234"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
**请求体：**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "alice",
      "gender": "female",
      "partner": {
        "id": 2,
        "username": "bob"
      }
    },
    "token": "jwt_token_here"
  }
}
```

#### PUT /api/auth/password
**请求头：** `Authorization: Bearer <token>`

**请求体：**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**响应：**
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

### 3.2 配对接口

#### POST /api/pair/bind
**请求头：** `Authorization: Bearer <token>`

**请求体：**
```json
{
  "pair_code": "string"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": 2,
      "username": "bob"
    }
  }
}
```

### 3.3 愿望接口

#### GET /api/wishes
**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `status`: pending | realized | all (可选)
- `page`: 页码 (默认1)
- `limit`: 每页数量 (默认20)

**响应：**
```json
{
  "success": true,
  "data": {
    "wishes": [
      {
        "id": 1,
        "content": "想要一个口红💄",
        "status": "pending",
        "modify_status": "none",
        "created_at": "2024-01-15T10:30:00Z",
        "sender": {
          "id": 1,
          "username": "alice"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

#### POST /api/wishes
**请求头：** `Authorization: Bearer <token>`

**请求体：**
```json
{
  "content": "string"
}
```

#### PUT /api/wishes/:id/status
**请求体：**
```json
{
  "status": "realized"
}
```

#### PUT /api/wishes/:id/modify
**请求体：**
```json
{
  "reason": "string"
}
```

#### PUT /api/wishes/:id/modify/respond
**请求体：**
```json
{
  "accept": true | false
}
```

### 3.4 心情接口

#### GET /api/moods/current
**响应：**
```json
{
  "success": true,
  "data": {
    "mood": "😊",
    "note": "今天很开心！",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /api/moods
**请求体：**
```json
{
  "mood": "😊",
  "note": "string (可选)"
}
```

---

## 4. WebSocket 协议设计

### 4.1 连接流程

```
Client                          Server
  │                                │
  │─────── connect ───────────────►│
  │◄────── connection_ack ─────────│
  │                                │
  │─────── auth (token) ──────────►│
  │◄────── auth_success ──────────│
  │                                │
  │     (连接成功，开始通信)        │
```

### 4.2 事件列表

#### 客户端 → 服务器

| 事件 | 载荷 | 描述 |
|------|------|------|
| auth | `{ token }` | 用户认证 |
| wish:send | `{ content }` | 发送愿望 |
| wish:updateStatus | `{ wishId, status }` | 更新愿望状态 |
| wish:modifyRequest | `{ wishId, reason }` | 申请修改愿望 |
| wish:modifyRespond | `{ wishId, accept }` | 响应修改申请 |
| mood:update | `{ mood, note? }` | 更新心情 |
| message:read | `{ messageId }` | 标记消息已读 |

#### 服务器 → 客户端

| 事件 | 载荷 | 描述 |
|------|------|------|
| connected | `{ userId, partner }` | 连接成功 |
| auth:success | `{ user, partner }` | 认证成功 |
| auth:failed | `{ error }` | 认证失败 |
| wish:new | `{ wish }` | 新愿望 |
| wish:updated | `{ wish }` | 愿望更新 |
| wish:modifyRequest | `{ wishId, reason }` | 收到修改申请 |
| wish:modifyResponse | `{ wishId, accept }` | 修改申请结果 |
| mood:updated | `{ userId, mood, note }` | 心情更新 |
| message:deliver | `{ message }` | 离线消息送达 |
| notification | `{ type, title, body }` | 系统通知 |

### 4.3 心跳机制

```javascript
// 客户端每 30 秒发送一次心跳
setInterval(() => {
  socket.emit('ping');
}, 30000);

socket.on('pong', () => {
  // 连接正常
});
```

---

## 5. 前端架构

### 5.1 目录结构

```
frontend/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js              # 应用入口
│   ├── App.vue              # 根组件
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── views/                # 页面组件
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Home.vue
│   │   ├── Wishes.vue
│   │   ├── SendWish.vue
│   │   ├── Mood.vue
│   │   ├── Profile.vue
│   │   └── ModifyRequest.vue
│   ├── components/           # 通用组件
│   │   ├── WishCard.vue
│   │   ├── MoodPicker.vue
│   │   ├── BottomNav.vue
│   │   └── Toast.vue
│   ├── stores/               # Pinia 状态管理
│   │   ├── auth.js
│   │   ├── wishes.js
│   │   └── moods.js
│   ├── services/             # API 服务
│   │   ├── api.js
│   │   └── socket.js
│   ├── utils/                # 工具函数
│   │   └── helpers.js
│   └── assets/
│       └── styles/
│           ├── variables.css
│           └── global.css
```

### 5.2 状态管理 (Pinia)

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    partner: null
  }),
  
  getters: {
    isLoggedIn: state => !!state.token,
    isFemale: state => state.user?.gender === 'female',
    isMale: state => state.user?.gender === 'male'
  },
  
  actions: {
    async login(credentials) { /* ... */ },
    async register(data) { /* ... */ },
    async fetchUser() { /* ... */ }
  }
});
```

### 5.3 路由守卫

```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});
```

---

## 6. 后端架构

### 6.1 目录结构

```
backend/
├── package.json
├── frpc.ini
├── src/
│   ├── index.js              # 应用入口
│   ├── database.js           # 数据库初始化
│   ├── config.js             # 配置
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── wishes.js
│   │   ├── moods.js
│   │   └── pair.js
│   ├── middleware/
│   │   └── auth.js           # JWT 认证中间件
│   ├── services/
│   │   ├── authService.js
│   │   ├── wishService.js
│   │   ├── moodService.js
│   │   └── messageService.js
│   └── socket/
│       └── handler.js        # WebSocket 处理
```

### 6.2 中间件设计

```javascript
// JWT 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token无效' });
  }
};
```

### 6.3 服务层设计

```javascript
// services/wishService.js
class WishService {
  create(senderId, receiverId, content) {
    const stmt = db.prepare(`
      INSERT INTO wishes (sender_id, receiver_id, content)
      VALUES (?, ?, ?)
    `);
    return stmt.run(senderId, receiverId, content);
  }
  
  findByReceiver(receiverId, status) {
    // 查询逻辑
  }
  
  updateStatus(wishId, status) {
    // 更新逻辑
  }
}

module.exports = new WishService();
```

---

## 7. 安全设计

### 7.1 认证与授权

1. **JWT Token**
   - 有效期：7 天
   - 存储：localStorage（前端）+ HTTP Only Cookie（可选）

2. **密码安全**
   - bcrypt 加密（salt rounds: 12）
   - 密码强度验证（最少8位）

3. **配对码安全**
   - 6位随机字母数字组合
   - 一次性使用

### 7.2 数据校验

```javascript
// 使用 express-validator
const validateWish = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('愿望内容长度应在1-500字之间')
];
```

### 7.3 防止攻击

- **SQL 注入：** 使用参数化查询
- **XSS：** 输入输出转义
- **CSRF：** Token 验证
- **频率限制：** 同一接口请求限制

---

## 8. 性能优化

### 8.1 数据库优化

1. **索引优化**
   - 为常用查询字段添加索引
   - 避免过度索引

2. **查询优化**
   - 使用 LIMIT 限制返回数量
   - 避免 SELECT *

3. **连接池**
   - better-sqlite3 使用同步API，无需连接池

### 8.2 前端优化

1. **代码分割**
   - 路由懒加载
   - 组件按需加载

2. **缓存策略**
   - API 响应缓存
   - 离线数据缓存（IndexedDB）

3. **图片优化**
   - 使用 SVG 图标
   - 压缩静态资源

---

## 9. 部署架构

### 9.1 Termux 环境配置

```bash
# 安装必要工具
pkg update && pkg upgrade
pkg install nodejs
pkg install vim

# 创建项目目录
mkdir -p ~/wishbridge/backend
cd ~/wishbridge/backend

# 初始化项目
npm init -y

# 安装依赖
npm install express socket.io better-sqlite3 bcrypt jsonwebtoken cors dotenv
```

### 9.2 ChmlFrp 配置

**frpc.ini 文件内容：**

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

**启动命令：**
```bash
# 下载 frpc (如果是 ARM 架构)
pkg install wget
wget https://github.com/fatedier/frp/releases/download/v0.51.0/frp_0.51.0_linux_arm64.tar.gz
tar -xzf frp_0.51.0_linux_arm64.tar.gz

# 配置并启动
cp frpc.ini ~/wishbridge/backend/
cd ~/wishbridge/backend
./frp_0.51.0_linux_arm64/frpc -c frpc.ini

# 在另一个终端启动后端
node src/index.js
```

### 9.3 APK 构建流程

```bash
# 前端构建
cd frontend
npm install
npm run build

# 添加 Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init WishBridge com.wishbridge.app

# 添加 Android 平台
npm install @capacitor/android
npx cap add android

# 同步到 Android 项目
npx cap sync android

# 构建 APK
cd android
./gradlew assembleDebug
```

---

## 10. 监控与日志

### 10.1 日志系统

```javascript
// 使用 morgan 进行 HTTP 日志
const morgan = require('morgan');
app.use(morgan('combined'));

// 自定义日志格式
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms'
  ].join(' ');
}));
```

### 10.2 错误处理

```javascript
// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});
```

---

## 11. 备份与恢复

### 11.1 数据备份

```bash
# 备份 SQLite 数据库
cp ~/wishbridge/backend/data/wishbridge.db ~/wishbridge/backend/data/backup/$(date +%Y%m%d).db
```

### 11.2 数据恢复

```bash
# 恢复数据库
cp ~/wishbridge/backend/data/backup/20240115.db ~/wishbridge/backend/data/wishbridge.db
```

---

## 12. 扩展性考虑

### 12.1 水平扩展

- 当前架构为单节点部署
- 如需扩展，可将 SQLite 替换为 PostgreSQL + Redis
- 使用负载均衡器分发请求

### 12.2 功能扩展

- **图片愿望：** 后续可支持上传图片
- **语音愿望：** 使用 Web Audio API
- **愿望分类：** 添加分类标签
- **提醒功能：** 定时提醒愿望到期

---

*文档版本：1.0*
*最后更新：2024-01-15*
