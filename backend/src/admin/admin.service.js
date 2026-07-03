const adminRepo = require('./admin.repository');

exports.listUsers = async (query = {}) => {
  return await adminRepo.findAllUsers(query.limit, query.offset, query.role, query.isActive);
};

exports.blockUser = async (adminId, targetUserId) => {
  if (adminId === targetUserId) {
    const error = new Error('Cannot block your own admin account');
    error.statusCode = 400;
    throw error;
  }

  const target = await adminRepo.findUserById(targetUserId);
  if (!target) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!target.isActive) {
    return target; // Already blocked
  }

  const updated = await adminRepo.updateUserActiveStatus(targetUserId, false);

  try {
    await adminRepo.createAdminLog({
      adminId,
      action: 'BLOCK_USER',
      entity: 'User',
      entityId: targetUserId
    });
  } catch (e) {
    console.error('Admin Log creation error:', e.message);
  }

  return updated;
};

exports.unblockUser = async (adminId, targetUserId) => {
  const target = await adminRepo.findUserById(targetUserId);
  if (!target) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (target.isActive) {
    return target; // Already active
  }

  const updated = await adminRepo.updateUserActiveStatus(targetUserId, true);

  try {
    await adminRepo.createAdminLog({
      adminId,
      action: 'UNBLOCK_USER',
      entity: 'User',
      entityId: targetUserId
    });
  } catch (e) {
    console.error('Admin Log creation error:', e.message);
  }

  return updated;
};

exports.deleteUser = async (adminId, targetUserId) => {
  if (adminId === targetUserId) {
    const error = new Error('Cannot delete your own admin account');
    error.statusCode = 400;
    throw error;
  }

  const target = await adminRepo.findUserById(targetUserId);
  if (!target) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const deleted = await adminRepo.deleteUser(targetUserId);

  try {
    await adminRepo.createAdminLog({
      adminId,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: targetUserId
    });
  } catch (e) {
    console.error('Admin Log creation error:', e.message);
  }

  return deleted;
};

exports.listListings = async (query = {}) => {
  return await adminRepo.findAllListings(query.limit, query.offset, query.status);
};

exports.removeListing = async (adminId, listingId) => {
  const listing = await adminRepo.findListingById(listingId);
  if (!listing) {
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }

  await adminRepo.softDeleteListing(listingId);

  try {
    await adminRepo.createAdminLog({
      adminId,
      action: 'REMOVE_LISTING',
      entity: 'Listing',
      entityId: listingId
    });

    const notifService = require('../notifications/notification.service');
    await notifService.createNotification({
      userId: listing.ownerId,
      title: 'Listing Removed by Admin',
      message: `Your listing "${listing.title}" was removed by an administrator.`,
      type: 'LISTING'
    });
  } catch (e) {
    console.error('Log / Notification error on removeListing:', e.message);
  }

  return { message: 'Listing removed successfully' };
};

exports.markListingSpam = async (adminId, listingId) => {
  const listing = await adminRepo.findListingById(listingId);
  if (!listing) {
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }

  const updated = await adminRepo.updateListingStatus(listingId, 'HIDDEN');

  try {
    await adminRepo.createAdminLog({
      adminId,
      action: 'MARK_SPAM',
      entity: 'Listing',
      entityId: listingId
    });

    const notifService = require('../notifications/notification.service');
    await notifService.createNotification({
      userId: listing.ownerId,
      title: 'Listing Marked as Spam',
      message: `Your listing "${listing.title}" has been flagged as spam and hidden from search results.`,
      type: 'LISTING'
    });
  } catch (e) {
    console.error('Log / Notification error on markListingSpam:', e.message);
  }

  return { message: 'Listing marked as spam and hidden from search results', listing: updated };
};

exports.getDashboardStats = async () => {
  return await adminRepo.getDashboardCounts();
};
