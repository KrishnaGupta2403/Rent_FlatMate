const listingRepo = require('./listing.repository');

exports.getPublicListings = async () => {
  return await listingRepo.findPublicListings();
};

exports.getPublicListingById = async (id) => {
  const listing = await listingRepo.findPublicListingById(id);
  if (!listing) {
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }
  return listing;
};

exports.getListingImages = async (listingId) => {
  return await listingRepo.findListingImages(listingId);
};
