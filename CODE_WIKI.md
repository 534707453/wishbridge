# WishBridge 项目文档

## 1. 项目概述

WishBridge 是一款专为情侣设计的愿望分享应用，旨在帮助情侣之间更好地沟通和实现彼此的愿望。

### 1.1 项目定位

- **目标用户**: 情侣、夫妻等亲密关系中的双方
- **核心价值**: 建立情侣间的愿望桥梁，增进彼此了解和互动
- **主要功能**: 愿望发送、愿望管理、心情状态共享、伴侣绑定

### 1.2 技术架构

| 层次 | 技术 | 版本 |
|------|------|------|
| 前端 | Android | API 34 |
| 后端 | Spring Boot | 3.2.0 |
| 数据库 | SQLite | - |
| 网络通信 | OkHttp | 4.12.0 |
| WebSocket | Spring WebSocket | - |
| 序列化 | Gson | 2.10.1 |
| 构建工具 | Gradle | 8.0 |
| Java版本 | JDK | 17 (Android), 21 (Backend) |

---

## 2. 项目结构

```
wishbridge/
├── app/                              # Android 客户端
│   ├── src/main/java/com/wishbridge/app/
│   │   ├── ApiService.java           # API 服务封装
│   │   ├── AppConfig.java            # 配置类
│   │   ├── UserSession.java          # 用户会话管理
│   │   ├── MainActivity.java         # 首页入口
│   │   ├── LoginActivity.java        # 登录页
│   │   ├── RegisterActivity.java     # 注册页
│   │   ├── GirlMainActivity.java     # 女方主页面
│   │   ├── BoyMainActivity.java      # 男方主页面
│   │   ├── SendWishActivity.java     # 发送愿望页
│   │   ├── WishListActivity.java     # 愿望列表页
│   │   ├── ChangePasswordActivity.java # 修改密码页
│   │   └── dto/                      # 数据传输对象
│   │       ├── LoginResponse.java
│   │       ├── PartnerResponse.java
│   │       ├── UserDTO.java
│   │       └── WishResponse.java
│   ├── src/main/res/                 # 资源文件
│   │   ├── layout/                   # 布局文件
│   │   ├── values/                   # 配置值
│   │   └── mipmap/                   # 图标资源
│   ├── src/main/AndroidManifest.xml  # Android 配置
│   └── build.gradle                  # 构建配置
├── backend/                          # Spring Boot 后端
│   ├── src/main/java/com/wishbridge/
│   │   ├── WishBridgeApplication.java # 启动类
│   │   ├── controller/               # 控制器层
│   │   │   ├── AuthController.java
│   │   │   ├── WishController.java
│   │   │   ├── PartnerController.java
│   │   │   ├── UserController.java
│   │   │   └── OfflineMessageController.java
│   │   ├── service/                  # 服务层
│   │   │   ├── UserService.java
│   │   │   ├── WishService.java
│   │   │   ├── OfflineMessageService.java
│   │   │   ├── WishChangeRequestService.java
│   │   │   └── impl/                 # 服务实现
│   │   ├── repository/               # 数据访问层
│   │   │   ├── UserRepository.java
│   │   │   ├── WishRepository.java
│   │   │   ├── OfflineMessageRepository.java
│   │   │   └── WishChangeRequestRepository.java
│   │   ├── entity/                   # 实体类
│   │   │   ├── User.java
│   │   │   ├── Wish.java
│   │   │   ├── OfflineMessage.java
│   │   │   └── WishChangeRequest.java
│   │   ├── dto/                      # 数据传输对象
│   │   │   ├── request/              # 请求DTO
│   │   │   └── response/             # 响应DTO
│   │   ├── config/                   # 配置类
│   │   │   ├── SecurityConfig.java
│   │   │   └── WebSocketConfig.java
│   │   └── util/                     # 工具类
│   │       └── JwtUtil.java
│   ├── src/main/resources/
│   │   └── application.yml           # 应用配置
│   └── pom.xml                       # Maven 配置
├── android-sdk/                      # Android SDK
├── gradle-8.0/                       # Gradle 工具
├── jdk17/                            # JDK 17
└── frpc.ini                          # FRP 配置
```

---

## 3. 核心模块详解

### 3.1 Android 客户端模块

#### 3.1.1 核心组件

| 组件 | 职责 | 关键方法 |
|------|------|----------|
| `ApiService` | 网络请求封装 | `post()`, `get()`, `parseResponse()` |
| `AppConfig` | 全局配置管理 | `BASE_URL`, `WEB_SOCKET_URL` |
| `UserSession` | 用户会话状态 | `getInstance()`, `setUserId()`, `clear()` |

#### 3.1.2 页面流程

```
MainActivity (首页)
    ↓
    ├─→ LoginActivity (登录)
    │       ↓
    │       └─→ GirlMainActivity / BoyMainActivity (主页面)
    │                   ↓
    │                   ├─→ SendWishActivity (发送愿望)
    │                   ├─→ WishListActivity (愿望列表)
    │                   ├─→ ChangePasswordActivity (修改密码)
    │                   └─→ 退出 → MainActivity
    │
    └─→ RegisterActivity (注册)
            ↓
            └─→ LoginActivity
```

#### 3.1.3 关键类详解

**ApiService** (`file:///d:/lOVE/wishbridge/app/src/main/java/com/wishbridge/app/ApiService.java`)

封装了所有HTTP请求操作：

```java
// 核心方法
public static String post(String url, String json) throws Exception  // POST请求
public static String get(String url) throws Exception                 // GET请求
public static <T> T parseResponse(String response, Class<T> clazz)   // 解析响应
public static boolean isSuccess(String response)                      // 判断请求是否成功
```

**UserSession** (单例模式管理用户状态)

管理当前登录用户的会话信息，包括：
- userId, username, nickname, gender
- token, partnerId, partnerNickname

#### 3.1.4 DTO 定义

| DTO | 字段 | 说明 |
|-----|------|------|
| `LoginResponse` | userId, username, nickname, gender, token, partnerId, partnerNickname | 登录响应 |
| `PartnerResponse` | id, nickname, moodStatus, onlineStatus | 伴侣信息 |
| `WishResponse` | id, senderId, senderNickname, receiverId, content, status, createdAt | 愿望信息 |
| `UserDTO` | id, username, nickname, gender | 用户简要信息 |

---

### 3.2 Spring Boot 后端模块

#### 3.2.1 架构分层

```
┌─────────────────────────────────────────────────────┐
│                   Controller Layer                  │  # REST API 入口
├─────────────────────────────────────────────────────┤
│                    Service Layer                    │  # 业务逻辑处理
├─────────────────────────────────────────────────────┤
│                   Repository Layer                  │  # 数据访问
├─────────────────────────────────────────────────────┤
│                      Database                       │  # SQLite
└─────────────────────────────────────────────────────┘
```

#### 3.2.2 Controller 层

| Controller | 路径 | 功能 |
|------------|------|------|
| `AuthController` | `/api/auth` | 注册、登录、密码修改、退出 |
| `WishController` | `/api/wish` | 愿望发送、查询、状态更新 |
| `PartnerController` | `/api/partner` | 伴侣信息、心情状态、绑定 |
| `UserController` | `/api/user` | 用户查询 |
| `OfflineMessageController` | `/api/offline` | 离线消息管理 |

#### 3.2.3 Service 层

| Service | 职责 | 关键方法 |
|---------|------|----------|
| `UserService` | 用户管理 | `register()`, `login()`, `changePassword()` |
| `WishService` | 愿望管理 | `sendWish()`, `getWishesByReceiver()`, `updateWishStatus()` |
| `OfflineMessageService` | 离线消息 | `saveOfflineMessage()`, `getOfflineMessages()` |
| `WishChangeRequestService` | 愿望修改申请 | `createRequest()`, `approveRequest()` |

#### 3.2.4 Entity 实体

**User** (`file:///d:/lOVE/wishbridge/backend/src/main/java/com/wishbridge/entity/User.java`)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| username | String | 用户名(唯一) |
| password | String | 密码(加密) |
| nickname | String | 昵称 |
| gender | String | 性别 |
| partnerId | Long | 伴侣ID |
| onlineStatus | Boolean | 在线状态 |
| moodStatus | String | 心情状态 |
| createdAt | LocalDateTime | 创建时间 |

**Wish** (`file:///d:/lOVE/wishbridge/backend/src/main/java/com/wishbridge/entity/Wish.java`)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 愿望ID |
| senderId | Long | 发送者ID |
| receiverId | Long | 接收者ID |
| content | String | 愿望内容 |
| status | String | 状态(PENDING/COMPLETED) |
| updatedBy | Long | 更新者ID |
| createdAt | LocalDateTime | 创建时间 |

**OfflineMessage**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 消息ID |
| senderId | Long | 发送者ID |
| receiverId | Long | 接收者ID |
| messageType | String | 消息类型 |
| content | String | 消息内容 |
| readStatus | Boolean | 是否已读 |

**WishChangeRequest**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 请求ID |
| wishId | Long | 愿望ID |
| requesterId | Long | 请求者ID |
| newContent | String | 新内容 |
| status | String | 状态(PENDING/APPROVED/REJECTED) |

---

## 4. API 接口文档

### 4.1 认证接口

| 接口 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/auth/register` | POST | `username`, `password`, `nickname`, `gender` | 用户注册 |
| `/api/auth/login` | POST | `username`, `password` | 用户登录 |
| `/api/auth/change-password` | POST | `userId`, `oldPassword`, `newPassword` | 修改密码 |
| `/api/auth/logout` | POST | `userId` | 用户退出 |

### 4.2 愿望接口

| 接口 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/wish/send` | POST | `senderId`, `receiverId`, `content` | 发送愿望 |
| `/api/wish/received` | GET | `userId` | 获取收到的愿望 |
| `/api/wish/sent` | GET | `userId` | 获取发送的愿望 |
| `/api/wish/status` | PUT | `wishId`, `status`, `updatedBy` | 更新愿望状态 |
| `/api/wish/pending` | GET | `userId` | 获取待实现愿望 |
| `/api/wish/change-request` | POST | `requesterId`, `wishId`, `newContent` | 申请修改愿望 |
| `/api/wish/change-request/approve` | POST | `requestId` | 批准修改申请 |
| `/api/wish/change-request/reject` | POST | `requestId` | 拒绝修改申请 |

### 4.3 伴侣接口

| 接口 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/partner/info` | GET | `userId` | 获取伴侣信息 |
| `/api/partner/mood` | POST | `userId`, `moodStatus` | 更新心情状态 |
| `/api/partner/bind` | POST | `userId`, `partnerId` | 绑定伴侣 |
| `/api/partner/online-status` | GET | `userId` | 获取在线状态 |

### 4.4 用户接口

| 接口 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/user/find-by-username` | GET | `username` | 按用户名查询 |

### 4.5 离线消息接口

| 接口 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/offline/messages` | GET | `userId` | 获取离线消息 |
| `/api/offline/mark-read` | POST | `messageId` | 标记已读 |

---

## 5. 数据库设计

### 5.1 用户表 (users)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    partner_id INTEGER,
    online_status BOOLEAN DEFAULT FALSE,
    mood_status VARCHAR(20) DEFAULT '开心',
    mood_updated_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (partner_id) REFERENCES users(id)
);
```

### 5.2 愿望表 (wishes)

```sql
CREATE TABLE wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    updated_by INTEGER,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### 5.3 离线消息表 (offline_messages)

```sql
CREATE TABLE offline_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    content TEXT,
    read_status BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

### 5.4 愿望修改申请表 (wish_change_requests)

```sql
CREATE TABLE wish_change_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wish_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    new_content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at DATETIME,
    FOREIGN KEY (wish_id) REFERENCES wishes(id),
    FOREIGN KEY (requester_id) REFERENCES users(id)
);
```

---

## 6. 核心业务流程

### 6.1 用户注册登录流程

```
用户注册
    ↓
验证用户名是否存在
    ↓
密码加密存储
    ↓
创建用户记录

用户登录
    ↓
验证用户名密码
    ↓
生成JWT Token
    ↓
更新在线状态
    ↓
返回用户信息(含伴侣信息)
```

### 6.2 愿望发送流程

```
发送愿望请求
    ↓
验证发送者和接收者关系
    ↓
创建愿望记录(状态PENDING)
    ↓
检查接收者在线状态
    ↓
├─ 在线 → WebSocket推送
└─ 离线 → 保存离线消息
```

### 6.3 伴侣绑定流程

```
输入伴侣用户名
    ↓
查询伴侣用户
    ↓
验证双方性别不同
    ↓
更新双方partner_id
    ↓
更新在线状态
```

### 6.4 离线消息机制

```
发送消息
    ↓
检查接收者在线状态
    ↓
离线 → 保存到offline_messages表
    ↓
用户上线时
    ↓
查询未读消息
    ↓
WebSocket推送
    ↓
标记消息已读
```

---

## 7. 配置与运行

### 7.1 Android 客户端配置

**build.gradle** (`file:///d:/lOVE/wishbridge/app/build.gradle`)

```gradle
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.wishbridge.app'
    compileSdk 34
    defaultConfig {
        applicationId "com.wishbridge.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

**AppConfig** (`file:///d:/lOVE/wishbridge/app/src/main/java/com/wishbridge/app/AppConfig.java`)

```java
public class AppConfig {
    public static final String BASE_URL = "http://jp-2.frp.one:35661/api/";
    public static final String WEB_SOCKET_URL = "ws://jp-2.frp.one:35661/ws/wish";
}
```

### 7.2 后端配置

**application.yml** (`file:///d:/lOVE/wishbridge/backend/src/main/resources/application.yml`)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:sqlite:./wishbridge.db
    driver-class-name: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update
    show-sql: true
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai

jwt:
  secret: wishbridge-secret-key-2024
  expiration: 86400000
```

### 7.3 启动方式

**Android 客户端**

```bash
# 构建APK
cd wishbridge/app
../gradle-8.0/bin/gradle assembleRelease

# 构建输出路径: app/build/outputs/apk/release/app-release.apk
```

**后端服务**

```bash
cd wishbridge/backend
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/wishbridge-backend-1.0.0.jar
```

---

## 8. 依赖关系

### 8.1 Android 依赖

| 依赖 | GroupId | ArtifactId | 版本 | 用途 |
|------|---------|------------|------|------|
| AppCompat | androidx.appcompat | appcompat | 1.6.1 | Android基础组件 |
| Material | com.google.android.material | material | 1.11.0 | Material Design组件 |
| ConstraintLayout | androidx.constraintlayout | constraintlayout | 2.1.4 | 布局约束 |
| OkHttp | com.squareup.okhttp3 | okhttp | 4.12.0 | HTTP客户端 |
| Gson | com.google.code.gson | gson | 2.10.1 | JSON序列化 |

### 8.2 后端依赖

| 依赖 | GroupId | ArtifactId | 版本 | 用途 |
|------|---------|------------|------|------|
| Spring Web | org.springframework.boot | spring-boot-starter-web | 3.2.0 | Web框架 |
| Spring Data JPA | org.springframework.boot | spring-boot-starter-data-jpa | 3.2.0 | 数据访问 |
| Spring Security | org.springframework.boot | spring-boot-starter-security | 3.2.0 | 安全框架 |
| Spring WebSocket | org.springframework.boot | spring-boot-starter-websocket | 3.2.0 | WebSocket支持 |
| JJWT API | io.jsonwebtoken | jjwt-api | 0.12.5 | JWT生成解析 |
| JJWT Impl | io.jsonwebtoken | jjwt-impl | 0.12.5 | JWT实现 |
| JJWT Jackson | io.jsonwebtoken | jjwt-jackson | 0.12.5 | JWT JSON支持 |
| SQLite Dialect | org.hibernate.orm | hibernate-community-dialects | - | SQLite方言 |

---

## 9. 安全机制

### 9.1 密码安全

- 使用 BCrypt 算法进行密码加密存储
- 禁止明文存储密码
- 登录时验证加密后的密码

### 9.2 JWT 认证

- 登录成功后生成 JWT Token
- Token 包含用户ID等信息
- Token 有效期为 24 小时
- 后续请求携带 Token 进行身份验证

### 9.3 跨域配置

- 配置允许前端跨域访问
- 限制允许的源地址

### 9.4 SQL 注入防护

- 使用 Spring Data JPA 预编译语句
- 禁止拼接 SQL 字符串

---

## 10. 部署与运维

### 10.1 环境要求

| 环境 | 要求 |
|------|------|
| JDK | 17 (Android), 21 (Backend) |
| Gradle | 8.0+ |
| Maven | 3.8+ |
| Android SDK | API 34 |

### 10.2 目录结构

```
部署目录/
├── wishbridge-backend-1.0.0.jar  # 后端服务jar包
├── wishbridge.db                  # SQLite数据库文件
└── application.yml                # 配置文件
```

### 10.3 启动脚本

```bash
#!/bin/bash
export JAVA_HOME=/path/to/jdk21
nohup java -jar wishbridge-backend-1.0.0.jar > app.log 2>&1 &
echo $! > pid.txt
```

---

## 11. 附录

### 11.1 状态码说明

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 500 | 服务器内部错误 |

### 11.2 消息类型

| 类型 | 说明 |
|------|------|
| NEW_WISH | 新愿望 |
| WISH_STATUS_CHANGED | 愿望状态变更 |
| MOOD_CHANGE | 心情状态变更 |
| WISH_CHANGE_REQUEST | 愿望修改申请 |

### 11.3 愿望状态

| 状态 | 说明 |
|------|------|
| PENDING | 待实现 |
| COMPLETED | 已实现 |

---

**文档版本**: v1.0  
**生成日期**: 2025-05-27  
**项目名称**: WishBridge