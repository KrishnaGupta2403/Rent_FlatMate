const prisma = require('../../config/prisma');

exports.searchListings = async (whereClause, orderByClause, skip, take) => {
  return await prisma.listing.findMany({
    where: whereClause,
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
    orderBy: orderByClause,
    skip,
    take
  });
};

exports.countListings = async (whereClause) => {
  return await prisma.listing.count({
    where: whereClause
  });
};
