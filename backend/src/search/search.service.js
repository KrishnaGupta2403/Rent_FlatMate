const searchRepo = require('./search.repository');

exports.search = async (query) => {
  const {
    location, city,
    minRent, minBudget,
    maxRent, maxBudget,
    roomType,
    furnishing, furnishingStatus,
    availableDate, availableFrom,
    amenities,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = query;

  const whereClause = {
    deletedAt: null,
    status: 'ACTIVE'
  };

  const effectiveLoc = location || city;
  if (effectiveLoc && typeof effectiveLoc === 'string' && effectiveLoc.trim() !== '') {
    whereClause.location = {
      contains: effectiveLoc.trim(),
      mode: 'insensitive'
    };
  }

  const effectiveMin = minRent !== undefined ? minRent : minBudget;
  const effectiveMax = maxRent !== undefined ? maxRent : maxBudget;

  if (effectiveMin !== undefined || effectiveMax !== undefined) {
    whereClause.rent = {};
    if (effectiveMin !== undefined && !isNaN(effectiveMin)) {
      whereClause.rent.gte = parseInt(effectiveMin, 10);
    }
    if (effectiveMax !== undefined && !isNaN(effectiveMax)) {
      whereClause.rent.lte = parseInt(effectiveMax, 10);
    }
  }

  if (roomType && typeof roomType === 'string' && roomType.trim() !== '') {
    whereClause.roomType = {
      equals: roomType.trim(),
      mode: 'insensitive'
    };
  }

  const effectiveFurnishing = furnishing || furnishingStatus;
  if (effectiveFurnishing && typeof effectiveFurnishing === 'string' && effectiveFurnishing.trim() !== '') {
    whereClause.furnishingStatus = {
      equals: effectiveFurnishing.trim(),
      mode: 'insensitive'
    };
  }

  const effectiveDate = availableDate || availableFrom;
  if (effectiveDate && !isNaN(new Date(effectiveDate).getTime())) {
    whereClause.availableFrom = {
      lte: new Date(effectiveDate)
    };
  }

  if (amenities && typeof amenities === 'string' && amenities.trim() !== '') {
    const amenityList = amenities.split(',').map(a => a.trim()).filter(a => a !== '');
    if (amenityList.length > 0) {
      whereClause.AND = amenityList.map(amenityName => ({
        listingAmenities: {
          some: {
            amenity: {
              name: {
                equals: amenityName,
                mode: 'insensitive'
              }
            }
          }
        }
      }));
    }
  }

  const orderByClause = {};
  let field = sortBy;
  let order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

  if (sortBy === 'rent_asc') {
    field = 'rent';
    order = 'asc';
  } else if (sortBy === 'rent_desc') {
    field = 'rent';
    order = 'desc';
  } else if (sortBy === 'date_asc') {
    field = 'date';
    order = 'asc';
  } else if (sortBy === 'date_desc') {
    field = 'date';
    order = 'desc';
  }

  if (field === 'rent') {
    orderByClause.rent = order;
  } else {
    orderByClause.createdAt = order;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [totalCount, listings] = await Promise.all([
    searchRepo.countListings(whereClause),
    searchRepo.searchListings(whereClause, orderByClause, skip, limitNum)
  ]);

  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  return {
    pagination: {
      totalCount,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    },
    count: listings.length,
    listings
  };
};
