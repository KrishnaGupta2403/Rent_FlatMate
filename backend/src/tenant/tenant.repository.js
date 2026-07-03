const prisma = require('../../config/prisma');

exports.findProfileByUserId = async (userId) => {
  return await prisma.tenantProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profileImage: true
        }
      }
    }
  });
};

exports.upsertProfile = async (userId, data) => {
  return await prisma.tenantProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...data
    },
    update: data,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profileImage: true
        }
      }
    }
  });
};

exports.findActiveListingById = async (listingId) => {
  return await prisma.listing.findFirst({
    where: { id: listingId, deletedAt: null }
  });
};

exports.upsertFavorite = async (userId, listingId) => {
  return await prisma.savedListing.upsert({
    where: {
      userId_listingId: {
        userId,
        listingId
      }
    },
    create: {
      userId,
      listingId
    },
    update: {}
  });
};

exports.deleteFavorite = async (userId, listingId) => {
  return await prisma.savedListing.deleteMany({
    where: {
      userId,
      listingId
    }
  });
};

exports.findFavoritesByUserId = async (userId) => {
  return await prisma.savedListing.findMany({
    where: {
      userId,
      listing: {
        deletedAt: null,
        status: 'ACTIVE'
      }
    },
    include: {
      listing: {
        include: {
          images: true,
          listingAmenities: {
            include: { amenity: true }
          },
          owner: {
            select: {
              id: true,
              fullName: true,
              profileImage: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};
