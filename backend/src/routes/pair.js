const express = require('express');
const { run, get } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/bind', authMiddleware, (req, res) => {
  try {
    const { pair_code } = req.body;
    const userId = req.user.id;
    
    if (!pair_code) {
      return res.status(400).json({ 
        success: false, 
        error: '配对码为必填项' 
      });
    }
    
    const user = get('SELECT * FROM users WHERE id = ?', userId);
    
    if (user.partner_id) {
      return res.status(400).json({ 
        success: false, 
        error: '您已经有配对对象了' 
      });
    }
    
    const partner = get('SELECT id, gender, partner_id FROM users WHERE pair_code = ?', pair_code);
    
    if (!partner) {
      return res.status(400).json({ 
        success: false, 
        error: '配对码无效' 
      });
    }
    
    if (partner.partner_id) {
      return res.status(400).json({ 
        success: false, 
        error: '该配对码已被使用' 
      });
    }
    
    if (partner.gender === user.gender) {
      return res.status(400).json({ 
        success: false, 
        error: '只能与异性配对' 
      });
    }
    
    if (partner.id === userId) {
      return res.status(400).json({ 
        success: false, 
        error: '不能与自己配对' 
      });
    }
    
    run('UPDATE users SET partner_id = ? WHERE id = ?', partner.id, userId);
    run('UPDATE users SET partner_id = ? WHERE id = ?', userId, partner.id);
    
    const updatedPartner = get('SELECT id, username, gender FROM users WHERE id = ?', partner.id);
    
    res.json({
      success: true,
      data: {
        partner: updatedPartner
      }
    });
  } catch (err) {
    console.error('绑定配对错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.delete('/unbind', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = get('SELECT partner_id FROM users WHERE id = ?', userId);
    
    if (!user.partner_id) {
      return res.status(400).json({ 
        success: false, 
        error: '您还没有配对对象' 
      });
    }
    
    run('UPDATE users SET partner_id = NULL WHERE id = ?', userId);
    run('UPDATE users SET partner_id = NULL WHERE id = ?', user.partner_id);
    
    res.json({
      success: true,
      message: '已解除配对'
    });
  } catch (err) {
    console.error('解除配对错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.get('/status', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = get('SELECT partner_id FROM users WHERE id = ?', userId);
    
    let partner = null;
    if (user.partner_id) {
      partner = get('SELECT id, username, gender, created_at FROM users WHERE id = ?', user.partner_id);
    }
    
    res.json({
      success: true,
      data: {
        isPaired: !!user.partner_id,
        partner
      }
    });
  } catch (err) {
    console.error('获取配对状态错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;
