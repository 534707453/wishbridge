const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all, generatePairCode } = require('../database');
const config = require('../config');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, UnauthorizedError, ConflictError } = require('../utils/errors');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, gender, pair_code } = req.body;
    logger.info('注册请求', { username, gender, hasPairCode: !!pair_code });
    
    if (!username || !password || !gender) {
      throw new ValidationError('用户名、密码和性别为必填项');
    }
    
    if (!['male', 'female'].includes(gender)) {
      throw new ValidationError('性别必须是 male 或 female', 'gender');
    }
    
    if (password.length < 6) {
      throw new ValidationError('密码长度至少6位', 'password');
    }
    
    const existingUser = get('SELECT id FROM users WHERE username = ?', username);
    if (existingUser) {
      logger.warn('注册失败 - 用户名已存在', { username });
      throw new ConflictError('用户名已存在');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.debug('密码加密成功');
    
    let userPairCode = generatePairCode();
    let attempts = 0;
    while (get('SELECT id FROM users WHERE pair_code = ?', userPairCode) && attempts < 10) {
      userPairCode = generatePairCode();
      attempts++;
    }
    
    let partnerId = null;
    if (pair_code) {
      const partner = get('SELECT id, gender FROM users WHERE pair_code = ? AND partner_id IS NULL', pair_code);
      if (!partner) {
        logger.warn('注册失败 - 配对码无效', { pair_code });
        throw new ValidationError('配对码无效或已被使用', 'pair_code');
      }
      if (partner.gender === gender) {
        logger.warn('注册失败 - 同性别配对', { gender });
        throw new ValidationError('只能与异性配对', 'gender');
      }
      partnerId = partner.id;
      logger.info('自动配对成功', { partnerId });
    }
    
    const result = run(
      'INSERT INTO users (username, password, gender, pair_code, partner_id) VALUES (?, ?, ?, ?, ?)',
      username, hashedPassword, gender, userPairCode, partnerId
    );
    
    if (partnerId) {
      run('UPDATE users SET partner_id = ? WHERE id = ?', partnerId, result.lastInsertRowid);
      run('UPDATE users SET partner_id = ? WHERE id = ?', result.lastInsertRowid, partnerId);
    }
    
    const user = get('SELECT id, username, gender, pair_code FROM users WHERE id = ?', result.lastInsertRowid);
    
    const token = jwt.sign(
      { id: user.id, username: user.username, gender: user.gender },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    logger.info('注册成功', { userId: user.id, username: user.username });
    
    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    logger.info('登录请求', { username });
    
    if (!username || !password) {
      throw new ValidationError('用户名和密码为必填项');
    }
    
    const user = get('SELECT * FROM users WHERE username = ?', username);
    if (!user) {
      logger.warn('登录失败 - 用户不存在', { username });
      throw new UnauthorizedError('用户名或密码错误');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('登录失败 - 密码错误', { username });
      throw new UnauthorizedError('用户名或密码错误');
    }
    
    let partner = null;
    if (user.partner_id) {
      partner = get('SELECT id, username FROM users WHERE id = ?', user.partner_id);
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, gender: user.gender },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    logger.info('登录成功', { userId: user.id, username: user.username });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          gender: user.gender,
          pair_code: user.pair_code,
          partner
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      throw new ValidationError('旧密码和新密码为必填项');
    }
    
    if (newPassword.length < 6) {
      throw new ValidationError('新密码长度至少6位', 'newPassword');
    }
    
    const user = get('SELECT password FROM users WHERE id = ?', req.user.id);
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logger.warn('修改密码失败 - 旧密码错误', { userId: req.user.id });
      throw new UnauthorizedError('旧密码错误');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', hashedPassword, req.user.id);
    
    logger.info('密码修改成功', { userId: req.user.id });
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, (req, res, next) => {
  try {
    const user = get('SELECT id, username, gender, pair_code, partner_id, created_at FROM users WHERE id = ?', req.user.id);
    
    if (!user) {
      logger.warn('获取用户信息失败 - 用户不存在', { userId: req.user.id });
      throw new NotFoundError('用户不存在');
    }
    
    let partner = null;
    if (user.partner_id) {
      partner = get('SELECT id, username, gender FROM users WHERE id = ?', user.partner_id);
    }
    
    res.json({
      success: true,
      data: {
        user: {
          ...user,
          partner
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
