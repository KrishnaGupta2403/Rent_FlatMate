const notifRepo = require('./notification.repository');

exports.createNotification = async ({ userId, title, message, type = 'LISTING' }) => {
  if (!userId || !title || !message) {
    throw new Error('userId, title, and message are required for notification');
  }

  const notif = await notifRepo.createNotification({
    userId,
    title,
    message,
    type
  });

  // Emit real-time notification if user is online via Socket.IO
  try {
    const { getIO, getOnlineUsers } = require('../socket/socket');
    const onlineUsers = getOnlineUsers();
    if (onlineUsers.has(userId)) {
      const io = getIO();
      onlineUsers.get(userId).forEach(socketId => {
        io.to(socketId).emit('newNotification', notif);
      });
    }
  } catch (e) {
    // Silent catch if socket server isn't running in test worker
  }

  return notif;
};

exports.getUserNotifications = async (userId, query = {}) => {
  const limit = query.limit || 50;
  const offset = query.offset || 0;
  return await notifRepo.findUserNotifications(userId, limit, offset);
};

exports.markNotificationAsRead = async (userId, notificationId) => {
  await notifRepo.markAsRead(notificationId, userId);
  return { message: 'Notification marked as read' };
};

exports.markAllNotificationsAsRead = async (userId) => {
  await notifRepo.markAllAsRead(userId);
  return { message: 'All notifications marked as read' };
};

exports.notifyListingFilled = async (listingId, listingTitle) => {
  const tenantIds = await notifRepo.findTenantsInterestedInListing(listingId);
  const results = [];
  for (const tid of tenantIds) {
    const notif = await exports.createNotification({
      userId: tid,
      title: 'Listing Filled',
      message: `Listing "${listingTitle}" has been marked as filled and is no longer available.`,
      type: 'LISTING'
    });
    results.push(notif);
  }
  return results;
};
