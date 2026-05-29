const express = require('express');
const { run, get, all } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/cached', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    const messages = all(`
      SELECT * FROM messages_cache 
      WHERE to_user_id = ? AND is_read = 0
      ORDER BY created_at ASC
    `, userId);
    
    res.json({
      success: true,
      data: {
        messages: messages.map(m => ({
          id: m.id,
          type: m.type,
          content: m.content,
          from_user_id: m.from_user_id,
          created_at: m.created_at
        }))
      }
    });
  } catch (err) {
    console.error('获取离线消息错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/:id/read', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const message = get('SELECT * FROM messages_cache WHERE id = ? AND to_user_id = ?', id, userId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        error: '消息不存在' 
      });
    }
    
    run('UPDATE messages_cache SET is_read = 1 WHERE id = ?', id);
    
    res.json({
      success: true,
      message: '消息已标记为已读'
    });
  } catch (err) {
    console.error('标记消息已读错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/read-all', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    run('UPDATE messages_cache SET is_read = 1 WHERE to_user_id = ?', userId);
    
    res.json({
      success: true,
      message: '所有消息已标记为已读'
    });
  } catch (err) {
    console.error('标记所有消息已读错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;
