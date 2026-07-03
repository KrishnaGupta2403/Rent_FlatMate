exports.validateCreateListing = (req, res, next) => {
  const { title, location, rent, availableFrom, roomType, furnishing, furnishingStatus } = req.body || {};
  if (!title || !location || rent === undefined || !availableFrom || !roomType || !(furnishing || furnishingStatus)) {
    return res.status(400).json({
      error: 'Required fields missing: title, location, rent, availableFrom, roomType, and furnishing (or furnishingStatus) are required.'
    });
  }
  next();
};
