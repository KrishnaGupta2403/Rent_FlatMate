const prisma = require('../../config/prisma');

exports.findPublicListings = async () => {
  return await prisma.listing.findMany({
    where: {
      deletedAt: null,
      status: 'ACTIVE'
    },
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
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.findPublicListingById = async (id) => {
  return await prisma.listing.findFirst({
    where: {
      id,
      deletedAt: null,
      status: 'ACTIVE'
    },
    include: {
      images: true,
      listingAmenities: {
        include: { amenity: true }
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          profileImage: true
        }
      }
    }
  });
};

exports.findListingImages = async (listingId) => {
  return await prisma.listingImage.findMany({
    where: { listingId }
  });
};
