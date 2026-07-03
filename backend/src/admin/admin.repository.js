const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findAllUsers = async (limit = 50, offset = 0, role, isActive) => {
  const where = {};
  if (role) where.role = role.toUpperCase();
  if (typeof isActive === 'boolean') where.isActive = isActive;
  else if (isActive === 'true') where.isActive = true;
  else if (isActive === 'false') where.isActive = false;

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit, 10),
    skip: parseInt(offset, 10)
  });
};

exports.findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, role: true, isActive: true }
  });
};

exports.updateUserActiveStatus = async (id, isActive) => {
  return await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, fullName: true, email: true, role: true, isActive: true }
  });
};

exports.deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
    select: { id: true, email: true, role: true }
  });
};

exports.findAllListings = async (limit = 50, offset = 0, status) => {
  const where = { deletedAt: null };
  if (status) where.status = status.toUpperCase();

  return await prisma.listing.findMany({
    where,
    include: {
      owner: { select: { id: true, fullName: true, email: true } },
      images: true
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit, 10),
    skip: parseInt(offset, 10)
  });
};

exports.findListingById = async (id) => {
  return await prisma.listing.findFirst({
    where: { id, deletedAt: null }
  });
};

exports.softDeleteListing = async (id) => {
  return await prisma.listing.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

exports.updateListingStatus = async (id, status) => {
  return await prisma.listing.update({
    where: { id },
    data: { status }
  });
};

exports.getDashboardCounts = async () => {
  const [activeUsersCount, totalListingsCount, filledListingsCount, activeChatsCount, totalInterestsCount] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.listing.count({ where: { deletedAt: null } }),
    prisma.listing.count({ where: { status: 'FILLED', deletedAt: null } }),
    prisma.chat.count(),
    prisma.interestRequest.count()
  ]);

  return {
    activeUsers: activeUsersCount,
    totalListings: totalListingsCount,
    filledListings: filledListingsCount,
    activeChats: activeChatsCount,
    totalInterests: totalInterestsCount
  };
};

exports.createAdminLog = async ({ adminId, action, entity, entityId }) => {
  return await prisma.adminLog.create({
    data: {
      adminId,
      action,
      entity,
      entityId
    }
  });
};
