const aiService = require('./compatibility.service');

exports.getSortedListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const listings = await aiService.getSortedListingsForTenant(userId, req.query);
    return res.status(200).json({
      message: 'Listings sorted by compatibility score retrieved successfully',
      count: listings.length,
      listings
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Internal server error while evaluating compatibility' });
  }
};

exports.getListingCompatibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;
    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const compatibility = await aiService.getCompatibilityScore(userId, listingId);
    return res.status(200).json({
      message: 'Compatibility score evaluated successfully',
      compatibility
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Internal server error while evaluating compatibility' });
  }
};
