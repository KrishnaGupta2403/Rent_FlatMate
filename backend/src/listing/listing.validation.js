exports.validateListingId = (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Listing ID is required' });
  }
  next();
};
