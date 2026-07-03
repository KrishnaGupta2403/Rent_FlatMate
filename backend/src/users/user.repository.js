const prisma = require('../../config/prisma');

exports.findUserByIdWithProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      profileImage: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      tenantProfile: true
    }
  });
};

exports.updateUserProfile = async (userId, userUpdateData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: userUpdateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      profileImage: true,
      role: true,
      isVerified: true,
      isActive: true,
      tenantProfile: true
    }
  });
};

exports.findUserByIdWithPassword = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true }
  });
};

exports.updateUserPassword = async (userId, hashedPassword) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

