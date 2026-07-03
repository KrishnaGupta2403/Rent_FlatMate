const listingService = require('./listing.service');
const searchService = require('../search/search.service');

exports.getPublicListings = async (req, res) => {
  try {
    const result = await searchService.search(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get public listings error:', error);
    return res.status(500).json({ error: 'Server error while retrieving listings' });
  }
};

exports.getPublicListingById = async (req, res) => {
  try {
    const listing = await listingService.getPublicListingById(req.params.id);
    return res.status(200).json({ listing });
  } catch (error) {
    console.error('Get listing by ID error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while retrieving listing details' });
  }
};
