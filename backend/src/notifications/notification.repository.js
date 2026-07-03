const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createNotification = async ({ userId, title, message, type }) => {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type
    }
  });
};

exports.findUserNotifications = async (userId, limit = 50, offset = 0) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit, 10),
    skip: parseInt(offset, 10)
  });
};

exports.markAsRead = async (notificationId, userId) => {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId
    },
    data: {
      isRead: true
    }
  });
};

exports.markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: {
      isRead: true
    }
  });
};

exports.createEmailLog = async ({ recipientEmail, subject, status }) => {
  return await prisma.emailLog.create({
    data: {
      recipientEmail,
      subject,
      status
    }
  });
};

exports.findFailedEmails = async () => {
  return await prisma.emailLog.findMany({
    where: { status: 'FAILED' },
    orderBy: { sentAt: 'asc' },
    take: 20
  });
};

exports.updateEmailLogStatus = async (id, status) => {
  return await prisma.emailLog.update({
    where: { id },
    data: { status, sentAt: new Date() }
  });
};

exports.findTenantsInterestedInListing = async (listingId) => {
  const requests = await prisma.interestRequest.findMany({
    where: {
      listingId,
      status: { in: ['PENDING', 'ACCEPTED'] }
    },
    select: { tenantId: true }
  });
  return requests.map(r => r.tenantId);
};
