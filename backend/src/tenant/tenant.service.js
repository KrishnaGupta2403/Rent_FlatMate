const tenantRepo = require('./tenant.repository');

exports.getPreferences = async (userId) => {
  const profile = await tenantRepo.findProfileByUserId(userId);
  if (!profile) {
    const error = new Error('Tenant profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

exports.updatePreferences = async (userId, body) => {
  const {
    preferredLocation,
    minBudget,
    maxBudget,
    moveInDate,
    roomType,
    furnishingPreference,
    occupation,
    gender,
    genderPreference,
    lifestyle,
    smoking,
    pets,
    food,
    bio
  } = body;

  const data = {};
  if (preferredLocation !== undefined) data.preferredLocation = preferredLocation;
  if (minBudget !== undefined) data.minBudget = minBudget ? parseInt(minBudget, 10) : null;
  if (maxBudget !== undefined) data.maxBudget = maxBudget ? parseInt(maxBudget, 10) : null;
  if (moveInDate !== undefined) data.moveInDate = moveInDate ? new Date(moveInDate) : null;
  if (roomType !== undefined) data.roomType = roomType;
  if (furnishingPreference !== undefined) data.furnishingPreference = furnishingPreference;
  if (occupation !== undefined) data.occupation = occupation;
  if (gender !== undefined) data.gender = gender;
  if (genderPreference !== undefined) data.genderPreference = genderPreference;
  if (lifestyle !== undefined) data.lifestyle = lifestyle;
  if (smoking !== undefined) data.smoking = smoking;
  if (pets !== undefined) data.pets = pets;
  if (food !== undefined) data.food = food;
  if (bio !== undefined) data.bio = bio;

  return await tenantRepo.upsertProfile(userId, data);
};

exports.addFavorite = async (userId, listingId) => {
  const listing = await tenantRepo.findActiveListingById(listingId);
  if (!listing) {
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }
  return await tenantRepo.upsertFavorite(userId, listingId);
};

exports.removeFavorite = async (userId, listingId) => {
  await tenantRepo.deleteFavorite(userId, listingId);
  return { message: 'Listing removed from favorites' };
};

exports.getFavorites = async (userId) => {
  const favorites = await tenantRepo.findFavoritesByUserId(userId);
  return favorites.map(f => f.listing);
};
