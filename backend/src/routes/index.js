const express = require('express');
const authRoutes = require('./auth');
const pairRoutes = require('./pair');
const wishesRoutes = require('./wishes');
const moodsRoutes = require('./moods');
const messagesRoutes = require('./messages');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/pair', pairRoutes);
router.use('/wishes', wishesRoutes);
router.use('/moods', moodsRoutes);
router.use('/messages', messagesRoutes);

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'WishBridge 服务运行正常',
    timestamp: new Date().toISOString()
  });
});

router.get('/logs/errors', authMiddleware, (req, res) => {
  if (req.user.gender !== 'male') {
    return res.status(403).json({ success: false, error: '权限不足' });
  }
  
  const logs = logger.getErrorLogs();
  res.json({ success: true, data: logs });
});

router.get('/logs/access', authMiddleware, (req, res) => {
  if (req.user.gender !== 'male') {
    return res.status(403).json({ success: false, error: '权限不足' });
  }
  
  const logs = logger.getAccessLogs();
  res.json({ success: true, data: logs });
});

router.delete('/logs/errors', authMiddleware, (req, res) => {
  if (req.user.gender !== 'male') {
    return res.status(403).json({ success: false, error: '权限不足' });
  }
  
  logger.clearErrorLogs();
  res.json({ success: true, message: '错误日志已清空' });
});

module.exports = router;
