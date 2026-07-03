const authService = require('./auth.service');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    console.error('Registration error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during login' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return res.status(200).json({
      message: 'Token refreshed successfully',
      ...result
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during token refresh' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Forgot password error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during password reset' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Logout error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during logout' });
  }
};
