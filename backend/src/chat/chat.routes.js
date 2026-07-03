const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const authMiddleware = require('../auth/auth.middleware');

router.use(authMiddleware);

router.post('/', chatController.createChat);
router.get('/', chatController.getUserChats);
router.get('/:chatId', chatController.getChatById);
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.patch('/:chatId/read', chatController.markAsRead);

module.exports = router;
