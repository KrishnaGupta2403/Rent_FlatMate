const prisma = require('../../config/prisma');

exports.findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

exports.findUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

exports.createUser = async ({ fullName, email, password, phone, role }) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName,
        email,
        password,
        phone,
        role: role || 'TENANT'
      }
    });

    if (user.role === 'TENANT') {
      await tx.tenantProfile.create({
        data: { userId: user.id }
      });
    }

    return user;
  });
};

exports.createRefreshToken = async ({ userId, token, expiresAt }) => {
  return await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });
};

exports.findRefreshToken = async (token) => {
  return await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });
};

exports.deleteRefreshToken = async (token) => {
  return await prisma.refreshToken.deleteMany({
    where: { token }
  });
};

exports.updatePassword = async (userId, hashedPassword) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

exports.createEmailLog = async (data) => {
  return await prisma.emailLog.create({ data });
};
