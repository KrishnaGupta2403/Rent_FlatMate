const ownerRepo = require('./owner.repository');
const { uploadImage } = require('../uploads/cloudinary');
const fs = require('fs');

exports.createListing = async (ownerId, body) => {
  const {
    title,
    description,
    location,
    latitude,
    longitude,
    rent,
    securityDeposit,
    availableFrom,
    roomType,
    furnishing,
    furnishingStatus,
    occupancy
  } = body;

  const finalFurnishing = furnishingStatus || furnishing;
  if (!title || !location || rent === undefined || !availableFrom || !roomType || !finalFurnishing) {
    const error = new Error('Required fields missing: title, location, rent, availableFrom, roomType, and furnishing are required.');
    error.statusCode = 400;
    throw error;
  }

  return await ownerRepo.createListing({
    ownerId,
    title,
    description: description || 'No description provided.',
    location,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    rent: parseInt(rent, 10),
    securityDeposit: securityDeposit !== undefined ? parseInt(securityDeposit, 10) : parseInt(rent, 10),
    availableFrom: new Date(availableFrom),
    roomType,
    furnishingStatus: finalFurnishing,
    occupancy: occupancy ? parseInt(occupancy, 10) : 1,
    status: 'ACTIVE'
  });
};

exports.uploadPhotos = async (ownerId, listingId, files = []) => {
  const cleanupFiles = () => {
    files.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });
  };

  if (files.length === 0) {
    const error = new Error('No photo files uploaded');
    error.statusCode = 400;
    throw error;
  }

  const listing = await ownerRepo.findListingById(listingId);
  if (!listing) {
    cleanupFiles();
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }

  if (listing.ownerId !== ownerId) {
    cleanupFiles();
    const error = new Error('Forbidden. You can only upload photos to your own listings.');
    error.statusCode = 403;
    throw error;
  }

  const existingCount = await ownerRepo.countListingImages(listingId);
  let isFirst = existingCount === 0;
  const imageRecords = [];

  for (const file of files) {
    const url = await uploadImage(file.path, file.filename);
    const img = await ownerRepo.createListingImage({
      listingId,
      imageUrl: url,
      isPrimary: isFirst
    });
    imageRecords.push(img);
    if (isFirst) isFirst = false;
  }

  return imageRecords;
};

exports.editListing = async (ownerId, listingId, body) => {
  const listing = await ownerRepo.findListingById(listingId);
  if (!listing || listing.deletedAt !== null) {
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }

  if (listing.ownerId !== ownerId) {
    const error = new Error('Forbidden. You can only edit your own listings.');
    error.statusCode = 403;
    throw error;
  }

  const updateData = {};
  const {
    title,
    description,
    location,
    latitude,
    longitude,
    rent,
    securityDeposit,
    availableFrom,
    roomType,
    furnishing,
    furnishingStatus,
    occupancy,
    status
  } = body;

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
  if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
  if (rent !== undefined) updateData.rent = parseInt(rent, 10);
  if (securityDeposit !== undefined) updateData.securityDeposit = parseInt(securityDeposit, 10);
  if (availableFrom !== undefined) updateData.availableFrom = new Date(availableFrom);
  if (roomType !== undefined) updateData.roomType = roomType;
  if (furnishingStatus || furnishing) updateData.furnishingStatus = furnishingStatus || furnishing;
  if (occupancy !== undefined) updateData.occupancy = parseInt(occupancy, 10);
  if (status !== undefined) updateData.status = status;

  return await ownerRepo.updateListing(listingId, updateData);
};

exports.deleteListing = async (user, listingId) => {
  const listing = await ownerRepo.findListingById(listingId);
  if (!listing || listing.deletedAt !== null) {
    const error = new Error('Listing not found or already deleted');
    error.statusCode = 404;
    throw error;
  }

  if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
    const error = new Error('Forbidden. You can only delete your own listings.');
    error.statusCode = 403;
    throw error;
  }

  await ownerRepo.softDeleteListing(listingId);
  return { message: 'Listing soft-deleted successfully' };
};

exports.markAsFilled = async (ownerId, listingId) => {
  const listing = await ownerRepo.findListingById(listingId);
  if (!listing || listing.deletedAt !== null) {
    const error = new Error('Listing not found');
    error.statusCode = 404;
    throw error;
  }

  if (listing.ownerId !== ownerId) {
    const error = new Error('Forbidden. You can only update your own listings.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await ownerRepo.updateListing(listingId, { status: 'FILLED' });

  try {
    const notifService = require('../notifications/notification.service');
    await notifService.notifyListingFilled(listingId, listing.title);
  } catch (e) {
    console.error('Notification error on markAsFilled:', e.message);
  }

  return updated;
};

exports.getMyListings = async (ownerId) => {
  return await ownerRepo.findMyListings(ownerId);
};
