const adminService = require('./admin.service');

exports.listUsers = async (req, res) => {
  try {
    const users = await adminService.listUsers(req.query);
    return res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to list users' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id ? id.trim() : id;
    const user = await adminService.blockUser(req.user.id, cleanId);
    return res.status(200).json({
      message: 'User blocked successfully',
      user
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to block user' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id ? id.trim() : id;
    const user = await adminService.unblockUser(req.user.id, cleanId);
    return res.status(200).json({
      message: 'User unblocked successfully',
      user
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to unblock user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id ? id.trim() : id;
    const user = await adminService.deleteUser(req.user.id, cleanId);
    return res.status(200).json({
      message: 'User deleted successfully',
      user
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to delete user' });
  }
};

exports.listListings = async (req, res) => {
  try {
    const listings = await adminService.listListings(req.query);
    return res.status(200).json({
      message: 'Listings retrieved successfully',
      count: listings.length,
      listings
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to list listings' });
  }
};

exports.removeListing = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id ? id.trim() : id;
    const result = await adminService.removeListing(req.user.id, cleanId);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to remove listing' });
  }
};

exports.markSpam = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id ? id.trim() : id;
    const result = await adminService.markListingSpam(req.user.id, cleanId);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to mark listing as spam' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.status(200).json({
      message: 'Dashboard statistics retrieved successfully',
      stats
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to retrieve dashboard stats' });
  }
};
