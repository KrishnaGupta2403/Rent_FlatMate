const { Server } = require('socket.io');
const { verifyAccessToken } = require('../auth/jwt');
const chatService = require('../chat/chat.service');

let io;
const onlineUsers = new Map(); // Map<userId, Set<socketId>>

exports.initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
    }
  });

  // JWT Authentication Middleware for Socket Handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      const decoded = verifyAccessToken(token);
      socket.user = { ...decoded, id: decoded.id, userId: decoded.id };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.userId;

    // Track Online Status In-Memory
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Notify connected users of online status change
    io.emit('userStatusChanged', { userId, isOnline: true });

    // Allow querying online status of specific users
    socket.on('checkOnlineStatus', (userIds, callback) => {
      if (!Array.isArray(userIds) || typeof callback !== 'function') return;
      const statusMap = {};
      userIds.forEach(id => {
        statusMap[id] = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
      });
      callback({ statusMap });
    });

    // One-to-One Room Join Logic
    socket.on('joinRoom', async (payload, callback) => {
      try {
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
        const { chatId } = payload || {};
        if (!chatId) throw new Error('chatId is required');
        // Verify user is an authorized participant
        await chatService.getChatById(userId, chatId);
        const roomName = `chat_${chatId}`;
        socket.join(roomName);
        if (typeof callback === 'function') {
          callback({ status: 'joined', chatId });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ error: err.message });
        }
      }
    });

    // Message Send/Receive Event
    socket.on('sendMessage', async (payload, callback) => {
      try {
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
        const { chatId, message, messageType = 'TEXT' } = payload || {};
        // PERSIST FIRST: Never emit before it is saved to DB
        const savedMessage = await chatService.saveMessage(userId, {
          chatId,
          message,
          messageType
        });

        const roomName = `chat_${chatId}`;
        socket.to(roomName).emit('receiveMessage', savedMessage);

        if (typeof callback === 'function') {
          callback({ status: 'ok', message: savedMessage });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ error: err.message });
        }
      }
    });

    // Typing Indicators (no DB persistence required)
    socket.on('typing', (payload) => {
      if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
      const { chatId } = payload || {};
      if (chatId) {
        socket.to(`chat_${chatId}`).emit('userTyping', { chatId, userId });
      }
    });

    socket.on('stopTyping', (payload) => {
      if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
      const { chatId } = payload || {};
      if (chatId) {
        socket.to(`chat_${chatId}`).emit('userStoppedTyping', { chatId, userId });
      }
    });

    // Read Receipts
    socket.on('markAsRead', async (payload, callback) => {
      try {
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
        const { chatId } = payload || {};
        if (chatId) {
          await chatService.markChatAsRead(userId, chatId);
          socket.to(`chat_${chatId}`).emit('messagesRead', { chatId, readBy: userId });
          if (typeof callback === 'function') {
            callback({ status: 'ok' });
          }
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ error: err.message });
        }
      }
    });

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('userStatusChanged', { userId, isOnline: false });
        }
      }
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.IO server not initialized');
  }
  return io;
};

exports.getOnlineUsers = () => onlineUsers;
