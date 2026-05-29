const express = require('express');
const { run, get, all } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const MOOD_OPTIONS = ['😊', '😢', '😡', '😴', '🤔', '🥰', '😰', '😤'];

router.get('/current', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    const mood = get(`
      SELECT * FROM moods 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, userId);
    
    if (!mood) {
      return res.json({
        success: true,
        data: {
          mood: null,
          note: null,
          updated_at: null
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        mood: mood.mood,
        note: mood.note,
        updated_at: mood.created_at
      }
    });
  } catch (err) {
    console.error('获取心情错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.get('/partner', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = get('SELECT partner_id FROM users WHERE id = ?', userId);
    
    if (!user.partner_id) {
      return res.json({
        success: true,
        data: {
          mood: null,
          note: null,
          updated_at: null
        }
      });
    }
    
    const mood = get(`
      SELECT * FROM moods 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, user.partner_id);
    
    if (!mood) {
      return res.json({
        success: true,
        data: {
          mood: null,
          note: null,
          updated_at: null
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        mood: mood.mood,
        note: mood.note,
        updated_at: mood.created_at
      }
    });
  } catch (err) {
    console.error('获取伴侣心情错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { mood, note } = req.body;
    const userId = req.user.id;
    
    if (!mood || !MOOD_OPTIONS.includes(mood)) {
      return res.status(400).json({ 
        success: false, 
        error: `心情必须是以下之一: ${MOOD_OPTIONS.join(' ')}` 
      });
    }
    
    if (note && note.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: '心情备注不能超过50字' 
      });
    }
    
    const result = run(
      'INSERT INTO moods (user_id, mood, note) VALUES (?, ?, ?)',
      userId, mood, note || null
    );
    
    const insertedMood = get('SELECT * FROM moods WHERE id = ?', result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      data: {
        mood: insertedMood.mood,
        note: insertedMood.note,
        updated_at: insertedMood.created_at
      }
    });
  } catch (err) {
    console.error('更新心情错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const moods = all(`
      SELECT * FROM moods 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, userId, parseInt(limit), offset);
    
    const countResult = get('SELECT COUNT(*) as total FROM moods WHERE user_id = ?', userId);
    
    res.json({
      success: true,
      data: {
        moods: moods.map(m => ({
          mood: m.mood,
          note: m.note,
          created_at: m.created_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult ? countResult.total : 0
        }
      }
    });
  } catch (err) {
    console.error('获取心情历史错误:', err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;
