const interestService = require('./interest.service');

exports.sendInterest = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const listingId = req.params.listingId || req.body.listingId;
    const request = await interestService.sendInterest(tenantId, listingId);
    return res.status(201).json({
      message: 'Interest request sent successfully',
      request
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to send interest request' });
  }
};

exports.getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const requests = await interestService.getOwnerRequests(ownerId, req.query);
    return res.status(200).json({
      message: 'Owner interest requests retrieved successfully',
      count: requests.length,
      requests
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to retrieve owner interest requests' });
  }
};

exports.getTenantRequests = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const requests = await interestService.getTenantRequests(tenantId);
    return res.status(200).json({
      message: 'Tenant interest requests retrieved successfully',
      count: requests.length,
      requests
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to retrieve tenant interest requests' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const request = await interestService.updateStatusByOwner(ownerId, id, 'ACCEPTED');
    return res.status(200).json({
      message: 'Interest request accepted successfully',
      request
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to accept interest request' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const request = await interestService.updateStatusByOwner(ownerId, id, 'REJECTED');
    return res.status(200).json({
      message: 'Interest request rejected successfully',
      request
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to reject interest request' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;
    const request = await interestService.cancelInterestByTenant(tenantId, id);
    return res.status(200).json({
      message: 'Interest request cancelled successfully',
      request
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to cancel interest request' });
  }
};
