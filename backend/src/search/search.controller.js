const searchService = require('./search.service');

exports.searchListings = async (req, res) => {
  try {
    const result = await searchService.search(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Search error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during listing search' });
  }
};
