const express = require('express');
const { run, get, all } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    const user = get('SELECT partner_id FROM users WHERE id = ?', userId);
    
    if (!user.partner_id) {
      return res.json({
        success: true,
        data: {
          wishes: [],
          pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 }
        }
      });
    }
    
    let whereClause = `(sender_id = ? OR receiver_id = ?)`;
    let params = [userId, userId];
    
    if (status && status !== 'all') {
      whereClause += ` AND status = ?`;
      params.push(status);
    }
    
    const countResult = get(`SELECT COUNT(*) as total FROM wishes WHERE ${whereClause}`, ...params);
    const total = countResult ? countResult.total : 0;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const wishes = all(`
      SELECT 
        w.*,
        s.username as sender_username,
        r.username as receiver_username
      FROM wishes w
      JOIN users s ON w.sender_id = s.id
      JOIN users r ON w.receiver_id = r.id
      WHERE ${whereClause}
      ORDER BY w.created_at DESC
      LIMIT ? OFFSET ?
    `, ...params, parseInt(limit), offset).map(wish => ({
      id: wish.id,
      content: wish.content,
      status: wish.status,
      modify_request: wish.modify_request,
      modify_status: wish.modify_status,
      created_at: wish.created_at,
      updated_at: wish.updated_at,
      sender_id: wish.sender_id,
      sender: {
        id: wish.sender_id,
        username: wish.sender_username
      },
      receiver: {
        id: wish.receiver_id,
        username: wish.receiver_username
      }
    }));
    
    res.json({
      success: true,
      data: {
        wishes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      }
    });
  } catch (err) {
    console.error('获取愿望列表错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.user.id;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '愿望内容不能为空' 
      });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ 
        success: false, 
        error: '愿望内容不能超过500字' 
      });
    }
    
    const sender = get('SELECT partner_id FROM users WHERE id = ?', senderId);
    
    if (!sender.partner_id) {
      return res.status(400).json({ 
        success: false, 
        error: '您还没有配对对象，请先配对' 
      });
    }
    
    const result = run(
      'INSERT INTO wishes (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      senderId, sender.partner_id, content.trim()
    );
    
    const wish = get(`
      SELECT 
        w.*,
        s.username as sender_username,
        r.username as receiver_username
      FROM wishes w
      JOIN users s ON w.sender_id = s.id
      JOIN users r ON w.receiver_id = r.id
      WHERE w.id = ?
    `, result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      data: {
        wish: {
          id: wish.id,
          content: wish.content,
          status: wish.status,
          modify_status: wish.modify_status,
          created_at: wish.created_at,
          sender_id: wish.sender_id,
          sender: {
            id: wish.sender_id,
            username: wish.sender_username
          },
          receiver: {
            id: wish.receiver_id,
            username: wish.receiver_username
          }
        }
      }
    });
  } catch (err) {
    console.error('发送愿望错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/:id/status', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    if (!['pending', 'realized'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: '状态必须是 pending 或 realized' 
      });
    }
    
    const wish = get('SELECT * FROM wishes WHERE id = ?', id);
    
    if (!wish) {
      return res.status(404).json({ 
        success: false, 
        error: '愿望不存在' 
      });
    }
    
    if (wish.sender_id !== userId && wish.receiver_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '无权修改此愿望' 
      });
    }
    
    run('UPDATE wishes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', status, id);
    
    const updatedWish = get(`
      SELECT 
        w.*,
        s.username as sender_username,
        r.username as receiver_username
      FROM wishes w
      JOIN users s ON w.sender_id = s.id
      JOIN users r ON w.receiver_id = r.id
      WHERE w.id = ?
    `, id);
    
    res.json({
      success: true,
      data: {
        wish: {
          id: updatedWish.id,
          content: updatedWish.content,
          status: updatedWish.status,
          modify_status: updatedWish.modify_status,
          created_at: updatedWish.created_at,
          updated_at: updatedWish.updated_at,
          sender_id: updatedWish.sender_id,
          sender: {
            id: updatedWish.sender_id,
            username: updatedWish.sender_username
          },
          receiver: {
            id: updatedWish.receiver_id,
            username: updatedWish.receiver_username
          }
        }
      }
    });
  } catch (err) {
    console.error('更新愿望状态错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/:id/modify', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '修改理由不能为空' 
      });
    }
    
    if (reason.length > 200) {
      return res.status(400).json({ 
        success: false, 
        error: '修改理由不能超过200字' 
      });
    }
    
    const wish = get('SELECT * FROM wishes WHERE id = ?', id);
    
    if (!wish) {
      return res.status(404).json({ 
        success: false, 
        error: '愿望不存在' 
      });
    }
    
    if (wish.receiver_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '只有接收者才能申请修改' 
      });
    }
    
    if (wish.modify_status === 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: '已有待处理的修改申请' 
      });
    }
    
    run(`
      UPDATE wishes 
      SET modify_request = ?, modify_status = 'pending', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, reason.trim(), id);
    
    res.json({
      success: true,
      message: '修改申请已发送'
    });
  } catch (err) {
    console.error('申请修改愿望错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/:id/modify/respond', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;
    const userId = req.user.id;
    
    if (typeof accept !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'accept 参数必须是布尔值' 
      });
    }
    
    const wish = get('SELECT * FROM wishes WHERE id = ?', id);
    
    if (!wish) {
      return res.status(404).json({ 
        success: false, 
        error: '愿望不存在' 
      });
    }
    
    if (wish.sender_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '只有发送者才能响应修改申请' 
      });
    }
    
    if (wish.modify_status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: '没有待处理的修改申请' 
      });
    }
    
    if (accept) {
      run(`
        UPDATE wishes 
        SET modify_status = 'accepted', status = 'pending', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, id);
    } else {
      run(`
        UPDATE wishes 
        SET modify_status = 'rejected', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, id);
    }
    
    res.json({
      success: true,
      data: {
        accept,
        modify_status: accept ? 'accepted' : 'rejected'
      }
    });
  } catch (err) {
    console.error('响应修改申请错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const wish = get('SELECT * FROM wishes WHERE id = ?', id);
    
    if (!wish) {
      return res.status(404).json({ 
        success: false, 
        error: '愿望不存在' 
      });
    }
    
    if (wish.sender_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '只能删除自己发送的愿望' 
      });
    }
    
    run('DELETE FROM wishes WHERE id = ?', id);
    
    res.json({
      success: true,
      message: '愿望已删除'
    });
  } catch (err) {
    console.error('删除愿望错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;
