const tenantService = require('./tenant.service');

exports.getPreferences = async (req, res) => {
  try {
    const profile = await tenantService.getPreferences(req.user.id);
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Get preferences error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while retrieving tenant preferences' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const profile = await tenantService.updatePreferences(req.user.id, req.body);
    return res.status(200).json({
      message: 'Tenant preferences updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while updating tenant preferences' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const favorite = await tenantService.addFavorite(req.user.id, req.params.listingId);
    return res.status(201).json({
      message: 'Listing added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while adding favorite' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const result = await tenantService.removeFavorite(req.user.id, req.params.listingId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Remove favorite error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while removing favorite' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await tenantService.getFavorites(req.user.id);
    return res.status(200).json({
      count: favorites.length,
      favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Server error while retrieving favorites' });
  }
};
