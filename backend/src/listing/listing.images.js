const listingService = require('./listing.service');

exports.getImagesForListing = async (listingId) => {
  return await listingService.getListingImages(listingId);
};
