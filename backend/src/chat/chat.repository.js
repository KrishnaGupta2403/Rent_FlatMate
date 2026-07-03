const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findAcceptedInterestRequest = async (listingId, tenantId, ownerId) => {
  return await prisma.interestRequest.findFirst({
    where: {
      listingId,
      tenantId,
      ownerId,
      status: 'ACCEPTED'
    }
  });
};

exports.findAcceptedInterestByUserAndListing = async (userId, listingId) => {
  return await prisma.interestRequest.findFirst({
    where: {
      listingId,
      status: 'ACCEPTED',
      OR: [
        { tenantId: userId },
        { ownerId: userId }
      ]
    }
  });
};

exports.findChatByParticipants = async (listingId, tenantId, ownerId) => {
  return await prisma.chat.findFirst({
    where: {
      listingId,
      tenantId,
      ownerId
    },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      },
      tenant: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      }
    }
  });
};

exports.createChat = async ({ listingId, tenantId, ownerId }) => {
  return await prisma.chat.create({
    data: {
      listingId,
      tenantId,
      ownerId
    },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      },
      tenant: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      }
    }
  });
};

exports.findChatById = async (chatId) => {
  return await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      },
      tenant: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      }
    }
  });
};

exports.findUserChats = async (userId) => {
  return await prisma.chat.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { tenantId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      },
      tenant: {
        select: { id: true, fullName: true, email: true, profileImage: true }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
};

exports.findChatMessages = async (chatId, limit = 50, offset = 0) => {
  return await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    take: parseInt(limit, 10),
    skip: parseInt(offset, 10),
    include: {
      sender: {
        select: { id: true, fullName: true, profileImage: true }
      }
    }
  });
};

exports.createMessage = async ({ chatId, senderId, message, messageType = 'TEXT' }) => {
  return await prisma.message.create({
    data: {
      chatId,
      senderId,
      message,
      messageType
    },
    include: {
      sender: {
        select: { id: true, fullName: true, profileImage: true }
      }
    }
  });
};

exports.markMessagesAsRead = async (chatId, recipientUserId) => {
  return await prisma.message.updateMany({
    where: {
      chatId,
      senderId: { not: recipientUserId },
      isRead: false
    },
    data: {
      isRead: true
    }
  });
};
