# WishBridge Code Wiki

## 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [后端模块](#后端模块)
- [前端模块](#前端模块)
- [数据库设计](#数据库设计)
- [API 文档](#api-文档)
- [Socket 事件](#socket-事件)
- [项目运行方式](#项目运行方式)

---

## 项目概述

**WishBridge** 是一个专为情侣设计的互动应用，主要功能包括：

- 用户注册/登录与身份验证
- 情侣配对（通过配对码）
- 发送与管理愿望
- 心情状态分享
- 实时消息推送与通知

项目采用前后端分离架构，支持 Web 和 Android 平台。

---

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                        前端层                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Vue 3     │  │   Pinia     │  │  Capacitor  │      │
│  │   视图层    │  │   状态管理   │  │  移动端容器  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP / WebSocket
┌─────────────────────────────────────────────────────────┐
│                        后端层                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Express   │  │  Socket.io  │  │    REST     │      │
│  │   Web服务器  │  │  实时通信    │  │    API      │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                        数据层                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │           SQLite (sql.js) 本地文件数据库           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 技术栈

#### 后端

- **运行时**: Node.js
- **Web 框架**: Express.js
- **实时通信**: Socket.io
- **数据库**: sql.js (SQLite in JavaScript)
- **身份验证**: jsonwebtoken (JWT)
- **密码加密**: bcryptjs
- **跨域处理**: cors
- **环境配置**: dotenv

#### 前端

- **UI 框架**: Vue 3 (Composition API)
- **路由**: Vue Router
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **WebSocket 客户端**: socket.io-client
- **移动端容器**: Capacitor
- **构建工具**: Vite

---

## 后端模块

### 项目结构

```
backend/
├── src/
│   ├── config.js          # 配置文件
│   ├── database.js        # 数据库初始化与操作
│   ├── index.js           # 应用入口
│   ├── middleware/
│   │   └── auth.js        # JWT 认证中间件
│   ├── routes/            # API 路由
│   │   ├── auth.js
│   │   ├── index.js
│   │   ├── messages.js
│   │   ├── moods.js
│   │   ├── pair.js
│   │   └── wishes.js
│   ├── socket/
│   │   └── handler.js     # Socket.io 事件处理
│   └── utils/
│       └── logger.js      # 日志工具
├── package.json
└── frpc.ini              # FRP 内网穿透配置
```

### 核心模块说明

#### 1. [config.js](file:///d:/lOVE/wishbridge/backend/src/config.js)

配置模块，负责加载环境变量和应用配置。

**主要配置项**:
- `port`: 服务器端口（默认 8080）
- `jwtSecret`: JWT 密钥
- `jwtExpiresIn`: Token 过期时间（7天）
- `bcryptRounds`: bcrypt 加密轮数
- `serverAddr/serverPort`: 服务器地址配置

#### 2. [database.js](file:///d:/lOVE/wishbridge/backend/src/database.js)

数据库模块，使用 sql.js 管理 SQLite 数据库。

**核心功能**:
- `initDatabase()`: 初始化数据库，创建表结构
- `run(sql, ...params)`: 执行写操作，返回插入ID
- `get(sql, ...params)`: 查询单条记录
- `all(sql, ...params)`: 查询多条记录
- `exec(sql)`: 执行 SQL 语句
- `generatePairCode()`: 生成6位配对码

**数据库表**:
- `users`: 用户表
- `wishes`: 愿望表
- `moods`: 心情表
- `messages_cache`: 消息缓存表

#### 3. [index.js](file:///d:/lOVE/wishbridge/backend/src/index.js)

应用入口文件，负责:

- 初始化 Express 应用
- 配置中间件（CORS、JSON解析、日志、错误处理）
- 挂载 API 路由
- 初始化 Socket.io 服务器
- 启动 HTTP 服务器

#### 4. [logger.js](file:///d:/lOVE/wishbridge/backend/src/utils/logger.js)

日志工具模块，支持:

- `info/warn/error/debug`: 不同级别日志
- `access`: HTTP 请求日志
- `getErrorLogs/getAccessLogs`: 获取日志内容
- `clearErrorLogs`: 清空错误日志

日志文件存储在 `backend/logs/` 目录。

#### 5. [auth.js](file:///d:/lOVE/wishbridge/backend/src/middleware/auth.js)

JWT 认证中间件，验证请求头中的 Token。

#### 6. Socket 处理模块 [handler.js](file:///d:/lOVE/wishbridge/backend/src/socket/handler.js)

处理实时 WebSocket 通信，包括:

- 用户认证
- 愿望发送与状态更新
- 愿望修改申请与响应
- 心情更新
- 消息缓存与送达

---

## 前端模块

### 项目结构

```
frontend/
├── src/
│   ├── App.vue            # 根组件
│   ├── main.js            # 应用入口
│   ├── assets/
│   │   └── styles/
│   │       └── global.css # 全局样式
│   ├── components/        # 公共组件
│   │   ├── BottomNav.vue
│   │   ├── MoodPicker.vue
│   │   ├── Toast.vue
│   │   └── WishCard.vue
│   ├── router/
│   │   └── index.js       # 路由配置
│   ├── services/          # 服务层
│   │   ├── api.js         # API 客户端
│   │   ├── logger.js      # 前端日志
│   │   └── socket.js      # Socket 客户端
│   ├── stores/            # Pinia 状态管理
│   │   ├── auth.js
│   │   ├── moods.js
│   │   └── wishes.js
│   └── views/             # 页面组件
│       ├── Home.vue
│       ├── Login.vue
│       ├── ModifyRequest.vue
│       ├── Mood.vue
│       ├── Profile.vue
│       ├── Register.vue
│       ├── SendWish.vue
│       └── Wishes.vue
├── android/               # Android 原生工程
├── capacitor.config.json  # Capacitor 配置
├── vite.config.js
├── package.json
└── .env
```

### 核心模块说明

#### 1. [main.js](file:///d:/lOVE/wishbridge/frontend/src/main.js)

应用入口，初始化:
- Vue 应用实例
- Pinia 状态管理
- Vue Router 路由

#### 2. [router/index.js](file:///d:/lOVE/wishbridge/frontend/src/router/index.js)

路由配置，包含:

| 路由 | 页面 | 权限 |
|------|------|------|
| /login | 登录页 | 访客 |
| /register | 注册页 | 访客 |
| /home | 首页 | 需登录 |
| /wishes | 愿望列表 | 需登录 |
| /send-wish | 发送愿望 | 仅女性 |
| /mood | 心情页 | 需登录 |
| /profile | 个人中心 | 需登录 |

路由守卫会验证登录状态和性别权限。

#### 3. [api.js](file:///d:/lOVE/wishbridge/frontend/src/services/api.js)

Axios 实例封装，包含:

- 基础 URL 配置
- 请求拦截器：自动添加 Authorization 头
- 响应拦截器：处理 401 错误（自动跳转登录）
- 日志记录

#### 4. [auth.js](file:///d:/lOVE/wishbridge/frontend/src/stores/auth.js)

Pinia 认证状态管理，提供:

- `login()`: 登录
- `register()`: 注册
- `fetchUser()`: 获取当前用户信息
- `changePassword()`: 修改密码
- `bindPair()`: 绑定配对
- `unbindPair()`: 解除配对
- `logout()`: 登出

状态:
- `user`: 当前用户信息
- `partner`: 配对对象信息
- `token`: JWT Token
- `isLoggedIn/isFemale/isMale/isPaired`: 计算属性

---

## 数据库设计

### 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名，唯一 |
| password | TEXT | 加密后的密码 |
| gender | TEXT | 性别 (male/female) |
| pair_code | TEXT | 配对码，唯一 |
| partner_id | INTEGER | 配对用户ID，外键 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 愿望表 (wishes)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| sender_id | INTEGER | 发送者ID，外键 |
| receiver_id | INTEGER | 接收者ID，外键 |
| content | TEXT | 愿望内容 |
| status | TEXT | 状态 (pending/realized) |
| modify_request | TEXT | 修改申请理由 |
| modify_status | TEXT | 修改状态 (none/pending/accepted/rejected) |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 心情表 (moods)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户ID，外键 |
| mood | TEXT | 心情表情 |
| note | TEXT | 备注 |
| created_at | DATETIME | 创建时间 |

### 消息缓存表 (messages_cache)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| from_user_id | INTEGER | 发送者ID，外键 |
| to_user_id | INTEGER | 接收者ID，外键 |
| type | TEXT | 消息类型 |
| content | TEXT | 消息内容 |
| is_read | INTEGER | 是否已读 (0/1) |
| created_at | DATETIME | 创建时间 |

---

## API 文档

所有 API 路径前缀为 `/api`

### 认证接口 (/auth)

#### 注册
```
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "gender": "male|female",
  "pair_code": "string (optional)"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "string"
  }
}
```

#### 登录
```
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "string"
  }
}
```

#### 修改密码
```
PUT /auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "string",
  "newPassword": "string"
}
```

#### 获取当前用户
```
GET /auth/me
Authorization: Bearer <token>
```

### 配对接口 (/pair)

#### 绑定配对
```
POST /pair/bind
Authorization: Bearer <token>
Content-Type: application/json

{
  "pair_code": "string"
}
```

#### 解除配对
```
DELETE /pair/unbind
Authorization: Bearer <token>
```

### 愿望接口 (/wishes)

#### 获取愿望列表
```
GET /wishes?status=all&page=1&limit=20
Authorization: Bearer <token>
```

#### 发送愿望
```
POST /wishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string"
}
```

#### 更新愿望状态
```
PUT /wishes/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "pending|realized"
}
```

#### 申请修改愿望
```
PUT /wishes/:id/modify
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string"
}
```

#### 响应修改申请
```
PUT /wishes/:id/modify/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "accept": true|false
}
```

#### 删除愿望
```
DELETE /wishes/:id
Authorization: Bearer <token>
```

### 心情接口 (/moods)

#### 获取心情历史
```
GET /moods?limit=10
Authorization: Bearer <token>
```

### 健康检查
```
GET /health
```

### 日志接口（仅男性）

```
GET /logs/errors
GET /logs/access
DELETE /logs/errors
```

---

## Socket 事件

### 客户端 → 服务端

| 事件 | 数据 | 说明 |
|------|------|------|
| `auth` | `{ token: string }` | 用户认证 |
| `wish:send` | `{ content: string }` | 发送愿望 |
| `wish:updateStatus` | `{ wishId: number, status: string }` | 更新愿望状态 |
| `wish:modifyRequest` | `{ wishId: number, reason: string }` | 申请修改愿望 |
| `wish:modifyRespond` | `{ wishId: number, accept: boolean }` | 响应修改申请 |
| `mood:update` | `{ mood: string, note?: string }` | 更新心情 |
| `message:read` | `{ messageId: number }` | 标记消息已读 |
| `ping` | - | 心跳 |

### 服务端 → 客户端

| 事件 | 数据 | 说明 |
|------|------|------|
| `auth:success` | `{ user: object, partner: object }` | 认证成功 |
| `auth:failed` | `{ error: string }` | 认证失败 |
| `wish:sent` | `{ wish: object }` | 愿望已发送 |
| `wish:new` | `{ wish: object }` | 收到新愿望 |
| `wish:updated` | `{ wish: object }` | 愿望已更新 |
| `wish:modifyRequest` | `{ wishId, reason, requester }` | 收到修改申请 |
| `wish:modifyResponse` | `{ wishId, accept, modify_status }` | 收到修改响应 |
| `modify:requestSent` | `{ wishId, reason }` | 修改申请已发送 |
| `modify:responseSent` | `{ wishId, accept }` | 修改响应已发送 |
| `mood:updated` | `{ mood, note, updated_at }` | 心情已更新 |
| `message:deliver` | 缓存消息 | 投递离线消息 |
| `notification` | `{ type, title, body }` | 通知 |
| `error` | `{ error: string }` | 错误 |
| `pong` | - | 心跳响应 |

---

## 项目运行方式

### 环境要求

- Node.js >= 16.x
- npm 或 yarn

### 后端运行

```bash
cd backend
npm install
npm start
```

开发模式：
```bash
npm run dev
```

服务器默认运行在 `http://localhost:8080`

### 前端运行

#### Web 开发模式

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`

#### 构建生产版本

```bash
npm run build
```

#### Android 开发

1. 初始化 Capacitor（首次）：
```bash
npm run cap:init
npm run cap:add
```

2. 同步更改：
```bash
npm run cap:build
```

3. 打开 Android Studio：
```bash
npx cap open android
```

### 环境变量配置

#### 后端 (.env)

```env
PORT=8080
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### 前端 (.env)

```env
VITE_API_URL=http://localhost:8080
```

### 内网穿透

项目包含 FRP 配置 `frpc.ini`，可用于内网穿透，让外部网络访问本地服务。

---

## 依赖关系

### 后端依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| express | ^4.18.2 | Web 框架 |
| socket.io | ^4.6.1 | 实时通信 |
| jsonwebtoken | ^9.0.2 | JWT 认证 |
| bcryptjs | ^2.4.3 | 密码加密 |
| sql.js | ^1.10.3 | SQLite 数据库 |
| cors | ^2.8.5 | 跨域处理 |
| dotenv | ^16.3.1 | 环境变量 |

### 前端依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.3.8 | UI 框架 |
| vue-router | ^4.2.5 | 路由 |
| pinia | ^2.1.7 | 状态管理 |
| axios | ^1.6.2 | HTTP 客户端 |
| socket.io-client | ^4.6.1 | WebSocket 客户端 |
| @capacitor/* | ^5.x | 移动端容器 |

---

## 主要业务流程

### 1. 用户注册与配对

```
用户A注册 → 生成配对码
                    ↓
用户B注册 (输入配对码) → 自动配对 → 双方建立关系
```

### 2. 愿望发送与实现

```
发送者 (女) → 发送愿望 → 接收者 (男) 收到通知
                                    ↓
接收者更新状态为 "已实现" → 发送者收到通知
```

### 3. 愿望修改流程

```
接收者申请修改 → 发送者收到申请
                        ↓
发送者接受/拒绝 → 接收者收到响应
```

---

## 开发注意事项

1. **性别限制**: 某些功能仅限特定性别使用（如发送愿望仅限女性）
2. **配对限制**: 只能与异性配对
3. **Token 有效期**: 7天
4. **数据库**: 本地文件存储，路径 `backend/data/wishbridge.db`
5. **日志**: 错误日志会记录到文件，仅男性可访问日志 API

---
