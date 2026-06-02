const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { initDatabase } = require('./database');
const routes = require('./routes');
const logger = require('./utils/logger');
const { AppError, ValidationError, NotFoundError, UnauthorizedError } = require('./utils/errors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (req.path.startsWith('/api')) {
      logger.access(req, res, duration);
    }
  });
  
  next();
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let errorResponse = {
    success: false,
    error: {
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  };

  if (err instanceof AppError) {
    errorResponse = err.toJSON();
  } else {
    logger.error('Unhandled Error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body
    });

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.error.message = err.message;
      errorResponse.error.stack = err.stack;
    }
  }

  res.status(errorResponse.error.statusCode).json(errorResponse);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    message: err.message,
    stack: err.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: String(reason),
    promise: promise ? String(promise) : null
  });
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

app.use('/api', routes);

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

const PORT = Number(process.env.PORT) || config.port;

async function startServer() {
  try {
    await initDatabase();
    logger.info('数据库初始化成功');
    
    const { setupSocketHandlers } = require('./socket/handler');
    setupSocketHandlers(io);
    logger.info('Socket.io handlers 已初始化');
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`端口 ${PORT} 被占用`, { error: err.message });
        console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   ⚠️  端口 ${PORT} 已被占用！                          ║
║                                                    ║
║   请尝试以下方法：                                  ║
║   1. 查找并关闭占用端口的进程                      ║
║   2. 使用其他端口启动：                            ║
║      PORT=3000 node src/index.js                  ║
║                                                    ║
╚════════════════════════════════════════════════════╝
        `);
        process.exit(1);
      } else {
        logger.error('服务器错误', err);
      }
    });
    
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`WishBridge 服务器启动成功`, { port: PORT });
      console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🌉 WishBridge 服务器已启动                       ║
║                                                    ║
║   端口: ${PORT}                                      ║
║   访问地址: http://0.0.0.0:${PORT}                    ║
║   内网穿透: jp-2.frp.one:35661                      ║
║                                                    ║
║   API 健康检查: GET /api/health                      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    logger.error('服务器启动失败', {
      message: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
}

startServer();
