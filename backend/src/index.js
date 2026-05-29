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
  logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
});

app.use('/api', routes);

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

const PORT = config.port;

async function startServer() {
  try {
    await initDatabase();
    logger.info('数据库初始化成功');
    
    const { setupSocketHandlers } = require('./socket/handler');
    setupSocketHandlers(io);
    logger.info('Socket.io handlers 已初始化');
    
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
    logger.error('服务器启动失败', err);
    process.exit(1);
  }
}

startServer();
