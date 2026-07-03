const prisma = require('../../config/prisma');

exports.createListing = async (data) => {
  return await prisma.listing.create({ data });
};

exports.findListingById = async (id) => {
  return await prisma.listing.findUnique({ where: { id } });
};

exports.updateListing = async (id, data) => {
  return await prisma.listing.update({
    where: { id },
    data
  });
};

exports.softDeleteListing = async (id) => {
  return await prisma.listing.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: 'HIDDEN'
    }
  });
};

exports.findMyListings = async (ownerId) => {
  return await prisma.listing.findMany({
    where: {
      ownerId,
      deletedAt: null
    },
    include: {
      images: true,
      listingAmenities: {
        include: { amenity: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.countListingImages = async (listingId) => {
  return await prisma.listingImage.count({ where: { listingId } });
};

exports.createListingImage = async (data) => {
  return await prisma.listingImage.create({ data });
};
