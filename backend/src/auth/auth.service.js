const authRepo = require('./auth.repository');
const { hashPassword, comparePassword } = require('./bcrypt');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('./jwt');
const crypto = require('crypto');

// In-memory store for reset tokens (to match previous implementation behavior)
const resetTokens = new Map();

exports.register = async ({ fullName, email, password, phone, role }) => {
  const existing = await authRepo.findUserByEmail(email);
  if (existing) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const user = await authRepo.createUser({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role
  });

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await authRepo.createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt
  });

  return {
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

exports.login = async ({ email, password }) => {
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account has been blocked by an administrator');
    error.statusCode = 403;
    throw error;
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await authRepo.createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt
  });

  return {
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

exports.refreshToken = async (token) => {
  if (!token) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  const tokenRecord = await authRepo.findRefreshToken(token);
  if (!tokenRecord) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  if (new Date() > tokenRecord.expiresAt) {
    await authRepo.deleteRefreshToken(token);
    const error = new Error('Refresh token expired');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    await authRepo.deleteRefreshToken(token);
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: tokenRecord.user.id, email: tokenRecord.user.email, role: tokenRecord.user.role };
  const accessToken = generateAccessToken(payload);

  return { accessToken };
};

exports.requestPasswordReset = async (email) => {
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    const error = new Error('If an account exists with this email, a password reset link has been sent.');
    error.statusCode = 200;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 15 * 60 * 1000;
  resetTokens.set(resetToken, { userId: user.id, expires });

  await authRepo.createEmailLog({
    recipientEmail: email,
    subject: 'Password Reset Request',
    status: 'SENT'
  });

  return { message: 'Password reset link sent to email', resetToken };
};

exports.resetPassword = async ({ token, newPassword }) => {
  const record = resetTokens.get(token);
  if (!record || Date.now() > record.expires) {
    if (record) resetTokens.delete(token);
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);
  await authRepo.updatePassword(record.userId, hashedPassword);
  resetTokens.delete(token);

  return { message: 'Password has been reset successfully' };
};

exports.logout = async (token) => {
  if (token) {
    await authRepo.deleteRefreshToken(token);
  }
  return { message: 'Logged out successfully' };
};
