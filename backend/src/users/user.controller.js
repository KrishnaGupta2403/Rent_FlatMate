const userService = require('./user.service');

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during profile retrieval' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.user.role, req.body);
    return res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during profile update' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Change password error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during password change' });
  }
};

