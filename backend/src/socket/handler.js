const jwt = require('jsonwebtoken');
const { run, get, all } = require('../database');
const config = require('../config');

const connectedUsers = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('客户端连接:', socket.id);
    
    socket.on('auth', (data) => {
      try {
        const { token } = data;
        
        if (!token) {
          socket.emit('auth:failed', { error: 'Token required' });
          return;
        }
        
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = get('SELECT * FROM users WHERE id = ?', decoded.id);
        
        if (!user) {
          socket.emit('auth:failed', { error: 'User not found' });
          return;
        }
        
        socket.userId = user.id;
        socket.userData = {
          id: user.id,
          username: user.username,
          gender: user.gender,
          partner_id: user.partner_id
        };
        
        connectedUsers.set(user.id, socket.id);
        socket.join(`user:${user.id}`);
        
        if (user.partner_id) {
          socket.join(`partner:${user.partner_id}`);
        }
        
        socket.emit('auth:success', {
          user: socket.userData,
          partner: user.partner_id ? get('SELECT id, username, gender FROM users WHERE id = ?', user.partner_id) : null
        });
        
        const cachedMessages = all(`
          SELECT * FROM messages_cache 
          WHERE to_user_id = ? AND is_read = 0
          ORDER BY created_at ASC
        `, user.id);
        
        if (cachedMessages.length > 0) {
          cachedMessages.forEach(msg => {
            socket.emit('message:deliver', {
              id: msg.id,
              type: msg.type,
              content: msg.content,
              from_user_id: msg.from_user_id,
              created_at: msg.created_at
            });
          });
          
          run('UPDATE messages_cache SET is_read = 1 WHERE to_user_id = ?', user.id);
        }
        
        console.log(`用户 ${user.username} 已认证`);
      } catch (err) {
        console.error('Socket auth error:', err);
        socket.emit('auth:failed', { error: 'Authentication failed' });
      }
    });
    
    socket.on('wish:send', (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { error: 'Not authenticated' });
          return;
        }
        
        const { content } = data;
        
        if (!content || content.trim().length === 0) {
          socket.emit('error', { error: 'Content cannot be empty' });
          return;
        }
        
        const user = socket.userData;
        
        if (!user.partner_id) {
          socket.emit('error', { error: 'No partner bound' });
          return;
        }
        
        const result = run(
          'INSERT INTO wishes (sender_id, receiver_id, content) VALUES (?, ?, ?)',
          socket.userId, user.partner_id, content.trim()
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
        
        const wishData = {
          id: wish.id,
          content: wish.content,
          status: wish.status,
          modify_status: wish.modify_status,
          created_at: wish.created_at,
          sender: {
            id: wish.sender_id,
            username: wish.sender_username
          },
          receiver: {
            id: wish.receiver_id,
            username: wish.receiver_username
          }
        };
        
        socket.emit('wish:sent', { wish: wishData });
        
        const partnerSocketId = connectedUsers.get(user.partner_id);
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('wish:new', { wish: wishData });
          io.to(partnerSocketId).emit('notification', {
            type: 'new_wish',
            title: '新愿望',
            body: `${user.username} 发来了新愿望`
          });
        } else {
          run(
            'INSERT INTO messages_cache (from_user_id, to_user_id, type, content) VALUES (?, ?, ?, ?)',
            socket.userId, user.partner_id, 'new_wish', content
          );
        }
      } catch (err) {
        console.error('Wish send error:', err);
        socket.emit('error', { error: 'Failed to send wish' });
      }
    });
    
    socket.on('wish:updateStatus', (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { error: 'Not authenticated' });
          return;
        }
        
        const { wishId, status } = data;
        
        if (!['pending', 'realized'].includes(status)) {
          socket.emit('error', { error: 'Invalid status' });
          return;
        }
        
        const wish = get('SELECT * FROM wishes WHERE id = ?', wishId);
        
        if (!wish) {
          socket.emit('error', { error: 'Wish not found' });
          return;
        }
        
        if (wish.sender_id !== socket.userId && wish.receiver_id !== socket.userId) {
          socket.emit('error', { error: 'Not authorized' });
          return;
        }
        
        run('UPDATE wishes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', status, wishId);
        
        const updatedWish = get(`
          SELECT 
            w.*,
            s.username as sender_username,
            r.username as receiver_username
          FROM wishes w
          JOIN users s ON w.sender_id = s.id
          JOIN users r ON w.receiver_id = r.id
          WHERE w.id = ?
        `, wishId);
        
        const wishData = {
          id: updatedWish.id,
          content: updatedWish.content,
          status: updatedWish.status,
          modify_status: updatedWish.modify_status,
          created_at: updatedWish.created_at,
          updated_at: updatedWish.updated_at,
          sender: {
            id: updatedWish.sender_id,
            username: updatedWish.sender_username
          },
          receiver: {
            id: updatedWish.receiver_id,
            username: updatedWish.receiver_username
          }
        };
        
        socket.emit('wish:updated', { wish: wishData });
        
        const targetUserId = updatedWish.sender_id === socket.userId 
          ? updatedWish.receiver_id 
          : updatedWish.sender_id;
        
        const partnerSocketId = connectedUsers.get(targetUserId);
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('wish:updated', { wish: wishData });
          
          if (status === 'realized') {
            io.to(partnerSocketId).emit('notification', {
              type: 'wish_realized',
              title: '愿望已实现',
              body: `你的愿望已被 ${socket.userData.username} 实现啦！`
            });
          }
        } else {
          const msgType = status === 'realized' ? 'wish_realized' : 'wish_updated';
          run(
            'INSERT INTO messages_cache (from_user_id, to_user_id, type, content) VALUES (?, ?, ?, ?)',
            socket.userId, targetUserId, msgType, `愿望状态更新为 ${status}`
          );
        }
      } catch (err) {
        console.error('Wish update status error:', err);
        socket.emit('error', { error: 'Failed to update wish status' });
      }
    });
    
    socket.on('wish:modifyRequest', (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { error: 'Not authenticated' });
          return;
        }
        
        const { wishId, reason } = data;
        
        if (!reason || reason.trim().length === 0) {
          socket.emit('error', { error: 'Reason required' });
          return;
        }
        
        const wish = get('SELECT * FROM wishes WHERE id = ?', wishId);
        
        if (!wish) {
          socket.emit('error', { error: 'Wish not found' });
          return;
        }
        
        if (wish.receiver_id !== socket.userId) {
          socket.emit('error', { error: 'Only receiver can request modification' });
          return;
        }
        
        if (wish.modify_status === 'pending') {
          socket.emit('error', { error: 'Already has pending request' });
          return;
        }
        
        run(`
          UPDATE wishes 
          SET modify_request = ?, modify_status = 'pending', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, reason.trim(), wishId);
        
        socket.emit('modify:requestSent', { wishId, reason: reason.trim() });
        
        const senderSocketId = connectedUsers.get(wish.sender_id);
        if (senderSocketId) {
          io.to(senderSocketId).emit('wish:modifyRequest', {
            wishId,
            reason: reason.trim(),
            requester: socket.userData.username
          });
          io.to(senderSocketId).emit('notification', {
            type: 'modify_request',
            title: '修改申请',
            body: `${socket.userData.username} 想修改你的愿望`
          });
        } else {
          run(
            'INSERT INTO messages_cache (from_user_id, to_user_id, type, content) VALUES (?, ?, ?, ?)',
            socket.userId, wish.sender_id, 'modify_request', reason.trim()
          );
        }
      } catch (err) {
        console.error('Modify request error:', err);
        socket.emit('error', { error: 'Failed to send modify request' });
      }
    });
    
    socket.on('wish:modifyRespond', (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { error: 'Not authenticated' });
          return;
        }
        
        const { wishId, accept } = data;
        
        if (typeof accept !== 'boolean') {
          socket.emit('error', { error: 'Accept must be boolean' });
          return;
        }
        
        const wish = get('SELECT * FROM wishes WHERE id = ?', wishId);
        
        if (!wish) {
          socket.emit('error', { error: 'Wish not found' });
          return;
        }
        
        if (wish.sender_id !== socket.userId) {
          socket.emit('error', { error: 'Only sender can respond' });
          return;
        }
        
        if (wish.modify_status !== 'pending') {
          socket.emit('error', { error: 'No pending request' });
          return;
        }
        
        const newStatus = accept ? 'accepted' : 'rejected';
        const updateStatus = accept ? 'pending' : newStatus;
        
        run(`
          UPDATE wishes 
          SET modify_status = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, newStatus, updateStatus, wishId);
        
        socket.emit('modify:responseSent', { wishId, accept });
        
        const receiverSocketId = connectedUsers.get(wish.receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('wish:modifyResponse', {
            wishId,
            accept,
            modify_status: newStatus
          });
          io.to(receiverSocketId).emit('notification', {
            type: 'modify_response',
            title: accept ? '申请已接受' : '申请已拒绝',
            body: accept 
              ? `${socket.userData.username} 接受了你的修改申请` 
              : `${socket.userData.username} 拒绝了你的修改申请`
          });
        } else {
          run(
            'INSERT INTO messages_cache (from_user_id, to_user_id, type, content) VALUES (?, ?, ?, ?)',
            socket.userId, wish.receiver_id, 'modify_response', accept ? 'accepted' : 'rejected'
          );
        }
      } catch (err) {
        console.error('Modify respond error:', err);
        socket.emit('error', { error: 'Failed to respond' });
      }
    });
    
    socket.on('mood:update', (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { error: 'Not authenticated' });
          return;
        }
        
        const { mood, note } = data;
        
        const MOOD_OPTIONS = ['😊', '😢', '😡', '😴', '🤔', '🥰', '😰', '😤'];
        if (!MOOD_OPTIONS.includes(mood)) {
          socket.emit('error', { error: 'Invalid mood' });
          return;
        }
        
        const result = run(
          'INSERT INTO moods (user_id, mood, note) VALUES (?, ?, ?)',
          socket.userId, mood, note || null
        );
        
        const moodData = {
          mood,
          note: note || null,
          updated_at: new Date().toISOString()
        };
        
        socket.emit('mood:updated', moodData);
        
        const user = socket.userData;
        if (user.partner_id) {
          const partnerSocketId = connectedUsers.get(user.partner_id);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('mood:updated', {
              userId: socket.userId,
              ...moodData,
              username: user.username
            });
            io.to(partnerSocketId).emit('notification', {
              type: 'mood_change',
              title: '心情更新',
              body: `${user.username} 的心情变成了 ${mood}`
            });
          } else {
            run(
              'INSERT INTO messages_cache (from_user_id, to_user_id, type, content) VALUES (?, ?, ?, ?)',
              socket.userId, user.partner_id, 'mood_update', `${mood} ${note || ''}`
            );
          }
        }
      } catch (err) {
        console.error('Mood update error:', err);
        socket.emit('error', { error: 'Failed to update mood' });
      }
    });
    
    socket.on('message:read', (data) => {
      try {
        if (!socket.userId) {
          return;
        }
        
        const { messageId } = data;
        
        run('UPDATE messages_cache SET is_read = 1 WHERE id = ? AND to_user_id = ?', messageId, socket.userId);
      } catch (err) {
        console.error('Message read error:', err);
      }
    });
    
    socket.on('ping', () => {
      socket.emit('pong');
    });
    
    socket.on('disconnect', () => {
      console.log('客户端断开:', socket.id);
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });
}

module.exports = { setupSocketHandlers };
