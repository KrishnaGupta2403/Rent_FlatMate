const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findListingById = async (listingId) => {
  return await prisma.listing.findFirst({
    where: {
      id: listingId,
      deletedAt: null,
      status: 'ACTIVE'
    }
  });
};

exports.findExistingActiveRequest = async (tenantId, listingId) => {
  return await prisma.interestRequest.findFirst({
    where: {
      tenantId,
      listingId,
      status: {
        in: ['PENDING', 'ACCEPTED']
      }
    }
  });
};

exports.createRequest = async ({ tenantId, ownerId, listingId }) => {
  return await prisma.interestRequest.create({
    data: {
      tenantId,
      ownerId,
      listingId,
      status: 'PENDING'
    },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, phone: true }
      }
    }
  });
};

exports.findOwnerRequests = async (ownerId, status) => {
  const where = { ownerId };
  if (status) {
    where.status = status;
  }
  return await prisma.interestRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true, roomType: true }
      },
      tenant: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profileImage: true,
          tenantProfile: true
        }
      }
    }
  });
};

exports.findTenantRequests = async (tenantId) => {
  return await prisma.interestRequest.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true, roomType: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, phone: true }
      }
    }
  });
};

exports.findRequestById = async (id) => {
  return await prisma.interestRequest.findUnique({
    where: { id },
    include: {
      listing: true
    }
  });
};

exports.updateRequestStatus = async (id, status) => {
  return await prisma.interestRequest.update({
    where: { id },
    data: { status },
    include: {
      listing: {
        select: { id: true, title: true, location: true, rent: true }
      },
      tenant: {
        select: { id: true, fullName: true, email: true, phone: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, phone: true }
      }
    }
  });
};
