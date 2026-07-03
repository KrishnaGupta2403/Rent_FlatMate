const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTenantProfileByUserId = async (userId) => {
  return await prisma.tenantProfile.findUnique({
    where: { userId }
  });
};

exports.getTenantProfileById = async (tenantId) => {
  return await prisma.tenantProfile.findUnique({
    where: { id: tenantId }
  });
};

exports.getListingById = async (listingId) => {
  return await prisma.listing.findFirst({
    where: {
      id: listingId,
      deletedAt: null
    },
    include: {
      listingAmenities: {
        include: { amenity: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, phone: true }
      },
      images: true
    }
  });
};

exports.getAllActiveListings = async () => {
  return await prisma.listing.findMany({
    where: {
      deletedAt: null,
      status: 'ACTIVE'
    },
    include: {
      listingAmenities: {
        include: { amenity: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true, phone: true }
      },
      images: true
    }
  });
};

exports.getCachedScore = async (tenantId, listingId) => {
  return await prisma.compatibilityScore.findFirst({
    where: {
      tenantId,
      listingId
    },
    orderBy: {
      generatedAt: 'desc'
    }
  });
};

exports.saveScore = async ({ tenantId, listingId, score, explanation, generatedBy }) => {
  // Clean up any existing scores for this pair to avoid duplicates
  await prisma.compatibilityScore.deleteMany({
    where: { tenantId, listingId }
  });

  return await prisma.compatibilityScore.create({
    data: {
      tenantId,
      listingId,
      score,
      explanation,
      generatedBy
    }
  });
};
