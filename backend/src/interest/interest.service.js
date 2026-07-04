const interestRepo = require('./interest.repository');

exports.sendInterest = async (tenantId, listingId) => {
  if (!listingId) {
    const error = new Error('Listing ID is required');
    error.statusCode = 400;
    throw error;
  }

  const listing = await interestRepo.findListingById(listingId);
  if (!listing) {
    const error = new Error('Listing not found or is no longer active');
    error.statusCode = 404;
    throw error;
  }

  if (listing.ownerId === tenantId) {
    const error = new Error('You cannot send an interest request to your own listing');
    error.statusCode = 400;
    throw error;
  }

  const existing = await interestRepo.findExistingActiveRequest(tenantId, listingId);
  if (existing) {
    const error = new Error(
      existing.status === 'PENDING'
        ? 'You already have a pending interest request for this listing'
        : 'Your interest request for this listing has already been accepted'
    );
    error.statusCode = 409;
    throw error;
  }

  const newRequest = await interestRepo.createRequest({
    tenantId,
    ownerId: listing.ownerId,
    listingId
  });

  try {
    const notifService = require('../notifications/notification.service');
    await notifService.createNotification({
      userId: listing.ownerId,
      title: 'New Interest Request',
      message: `A tenant has sent an interest request for your listing: "${listing.title || 'Property'}"`,
      type: 'INTEREST'
    });
  } catch (e) {
    console.error('Notification error on sendInterest:', e.message);
  }

  return newRequest;
};

exports.getOwnerRequests = async (ownerId, query = {}) => {
  const status = query.status ? query.status.toUpperCase() : undefined;
  if (status && !['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'].includes(status)) {
    const error = new Error('Invalid status filter parameter');
    error.statusCode = 400;
    throw error;
  }
  return await interestRepo.findOwnerRequests(ownerId, status);
};

exports.getTenantRequests = async (tenantId) => {
  return await interestRepo.findTenantRequests(tenantId);
};

exports.updateStatusByOwner = async (ownerId, requestId, newStatus) => {
  if (!['ACCEPTED', 'REJECTED'].includes(newStatus)) {
    const error = new Error('Status must be either ACCEPTED or REJECTED');
    error.statusCode = 400;
    throw error;
  }

  const request = await interestRepo.findRequestById(requestId);
  if (!request) {
    const error = new Error('Interest request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.ownerId !== ownerId) {
    const error = new Error('Not authorized to modify this interest request');
    error.statusCode = 403;
    throw error;
  }

  if (request.status === newStatus) {
    return request;
  }

  const updatedRequest = await interestRepo.updateRequestStatus(requestId, newStatus);

  if (newStatus === 'ACCEPTED') {
    try {
      const chatRepo = require('../chat/chat.repository');
      const existingChat = await chatRepo.findChatByParticipants(
        updatedRequest.listingId,
        updatedRequest.tenantId,
        updatedRequest.ownerId
      );
      if (!existingChat) {
        await chatRepo.createChat({
          listingId: updatedRequest.listingId,
          tenantId: updatedRequest.tenantId,
          ownerId: updatedRequest.ownerId
        });
      }
    } catch (chatErr) {
      console.error('Failed to auto-create chat room on accept:', chatErr.message);
    }
  }

  try {
    const notifService = require('../notifications/notification.service');
    const emailService = require('../notifications/email.service');
    const title = `Interest Request ${newStatus}`;
    const msg = `Your interest request for listing "${updatedRequest.listing?.title || 'Property'}" was ${newStatus.toLowerCase()}.`;

    await notifService.createNotification({
      userId: updatedRequest.tenantId,
      title,
      message: msg,
      type: newStatus === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED'
    });

    if (updatedRequest.tenant?.email) {
      await emailService.sendEmail({
        to: updatedRequest.tenant.email,
        subject: title,
        html: `<p>${msg}</p>`
      });
    }
  } catch (e) {
    console.error('Notification/Email error on updateStatusByOwner:', e.message);
  }

  return updatedRequest;
};

exports.cancelInterestByTenant = async (tenantId, requestId) => {
  const request = await interestRepo.findRequestById(requestId);
  if (!request) {
    const error = new Error('Interest request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.tenantId !== tenantId) {
    const error = new Error('Not authorized to cancel this interest request');
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error('Only pending interest requests can be cancelled');
    error.statusCode = 400;
    throw error;
  }

  return await interestRepo.updateRequestStatus(requestId, 'CANCELLED');
};
