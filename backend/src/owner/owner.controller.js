const ownerService = require('./owner.service');

exports.createListing = async (req, res) => {
  try {
    const listing = await ownerService.createListing(req.user.id, req.body);
    return res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while creating listing' });
  }
};

exports.uploadListingPhotos = async (req, res) => {
  try {
    const images = await ownerService.uploadPhotos(req.user.id, req.params.id, req.files);
    return res.status(200).json({
      message: `${images.length} photo(s) uploaded successfully`,
      images
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error during photo upload' });
  }
};

exports.editListing = async (req, res) => {
  try {
    const listing = await ownerService.editListing(req.user.id, req.params.id, req.body);
    return res.status(200).json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Edit listing error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while editing listing' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const result = await ownerService.deleteListing(req.user, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete listing error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while deleting listing' });
  }
};

exports.markAsFilled = async (req, res) => {
  try {
    const listing = await ownerService.markAsFilled(req.user.id, req.params.id);
    return res.status(200).json({
      message: 'Listing marked as FILLED successfully',
      listing
    });
  } catch (error) {
    console.error('Mark as filled error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while updating listing status' });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await ownerService.getMyListings(req.user.id);
    return res.status(200).json({
      count: listings.length,
      listings
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while retrieving your listings' });
  }
};
