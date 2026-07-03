const chatService = require('./chat.service');

exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId, tenantId, ownerId } = req.body || {};
    const chat = await chatService.createOrGetChat(userId, { listingId, tenantId, ownerId });
    return res.status(201).json({
      message: 'Chat initialized successfully',
      chat
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to initialize chat' });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await chatService.getUserChats(userId);
    return res.status(200).json({
      message: 'User chats retrieved successfully',
      count: chats.length,
      chats
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to retrieve user chats' });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const chat = await chatService.getChatById(userId, chatId);
    return res.status(200).json({
      message: 'Chat retrieved successfully',
      chat
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to retrieve chat' });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const messages = await chatService.getChatMessages(userId, chatId, req.query);
    return res.status(200).json({
      message: 'Chat messages retrieved successfully',
      count: messages.length,
      messages
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to retrieve chat messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { chatId } = req.params;
    const body = req.body || {};
    const savedMessage = await chatService.saveMessage(senderId, {
      chatId,
      message: body.message,
      messageType: body.messageType || 'TEXT'
    });

    try {
      const { getIO } = require('../socket/socket');
      const io = getIO();
      io.to(`chat_${chatId}`).emit('receiveMessage', savedMessage);
    } catch (e) {
      // socket io might not be initialized during REST tests
    }

    return res.status(201).json({
      message: 'Message sent successfully',
      data: savedMessage
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to send message' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const result = await chatService.markChatAsRead(userId, chatId);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to mark messages as read' });
  }
};
