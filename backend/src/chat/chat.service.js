const chatRepo = require('./chat.repository');

exports.createOrGetChat = async (userId, { listingId, tenantId, ownerId, interestId }) => {
  if (!listingId && !interestId) {
    const error = new Error('listingId or interestId is required');
    error.statusCode = 400;
    throw error;
  }

  let accepted;
  if (listingId && tenantId && ownerId) {
    accepted = await chatRepo.findAcceptedInterestRequest(listingId, tenantId, ownerId);
    if (!accepted && (userId === tenantId || userId === ownerId)) {
      accepted = await chatRepo.findAcceptedInterestByUserAndListing(userId, listingId);
    }
  } else if (listingId) {
    accepted = await chatRepo.findAcceptedInterestByUserAndListing(userId, listingId);
  }

  if (!accepted) {
    const error = new Error('Cannot create chat: No accepted interest request exists between this tenant and owner for this listing');
    error.statusCode = 403;
    throw error;
  }

  const effectiveListingId = accepted.listingId;
  const effectiveTenantId = accepted.tenantId;
  const effectiveOwnerId = accepted.ownerId;

  if (userId !== effectiveTenantId && userId !== effectiveOwnerId) {
    const error = new Error('Not authorized to create a chat for these participants');
    error.statusCode = 403;
    throw error;
  }

  const existing = await chatRepo.findChatByParticipants(effectiveListingId, effectiveTenantId, effectiveOwnerId);
  if (existing) {
    return existing;
  }

  return await chatRepo.createChat({ listingId: effectiveListingId, tenantId: effectiveTenantId, ownerId: effectiveOwnerId });
};

exports.getUserChats = async (userId) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find all accepted interest requests involving the user
    const acceptedInterests = await prisma.interestRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { ownerId: userId },
          { tenantId: userId }
        ]
      }
    });

    // Make sure each accepted interest request has a chat room
    for (const interest of acceptedInterests) {
      const existing = await chatRepo.findChatByParticipants(
        interest.listingId,
        interest.tenantId,
        interest.ownerId
      );
      if (!existing) {
        await chatRepo.createChat({
          listingId: interest.listingId,
          tenantId: interest.tenantId,
          ownerId: interest.ownerId
        });
      }
    }
  } catch (err) {
    console.error('Failed to backfill missing chats in getUserChats:', err.message);
  }

  return await chatRepo.findUserChats(userId);
};

exports.getChatById = async (userId, chatId) => {
  const chat = await chatRepo.findChatById(chatId);
  if (!chat) {
    const error = new Error('Chat not found');
    error.statusCode = 404;
    throw error;
  }

  if (chat.ownerId !== userId && chat.tenantId !== userId) {
    const error = new Error('Not authorized to access this chat');
    error.statusCode = 403;
    throw error;
  }

  return chat;
};

exports.getChatMessages = async (userId, chatId, query = {}) => {
  await exports.getChatById(userId, chatId); // Verifies access authorization
  const limit = query.limit || 50;
  const offset = query.offset || 0;
  return await chatRepo.findChatMessages(chatId, limit, offset);
};

exports.saveMessage = async (senderId, { chatId, message, messageType = 'TEXT' }) => {
  if (!message || !message.trim()) {
    const error = new Error('Message content is required');
    error.statusCode = 400;
    throw error;
  }

  const chat = await exports.getChatById(senderId, chatId); // Verifies sender is a participant
  const savedMessage = await chatRepo.createMessage({
    chatId,
    senderId,
    message: message.trim(),
    messageType
  });

  try {
    const notifService = require('../notifications/notification.service');
    const recipientId = senderId === chat.ownerId ? chat.tenantId : chat.ownerId;
    await notifService.createNotification({
      userId: recipientId,
      title: 'New Chat Message',
      message: `You have a new message: "${savedMessage.message.substring(0, 40)}"`,
      type: 'CHAT'
    });
  } catch (e) {
    console.error('Notification error on saveMessage:', e.message);
  }

  return savedMessage;
};

exports.markChatAsRead = async (userId, chatId) => {
  await exports.getChatById(userId, chatId);
  await chatRepo.markMessagesAsRead(chatId, userId);
  return { message: 'Messages marked as read' };
};
