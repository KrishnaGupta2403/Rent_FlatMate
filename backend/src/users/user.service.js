const userRepo = require('./user.repository');
const { hashPassword, comparePassword } = require('../auth/bcrypt');

exports.getProfile = async (userId) => {
  const user = await userRepo.findUserByIdWithProfile(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

exports.updateProfile = async (userId, userRole, body) => {
  const {
    fullName,
    phone,
    profileImage,
    // TenantProfile fields
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

  const userUpdateData = {};
  if (fullName !== undefined) userUpdateData.fullName = fullName;
  if (phone !== undefined) userUpdateData.phone = phone;
  if (profileImage !== undefined) userUpdateData.profileImage = profileImage;

  if (userRole === 'TENANT') {
    const tenantData = {};
    if (preferredLocation !== undefined) tenantData.preferredLocation = preferredLocation;
    if (minBudget !== undefined) tenantData.minBudget = minBudget ? parseInt(minBudget, 10) : null;
    if (maxBudget !== undefined) tenantData.maxBudget = maxBudget ? parseInt(maxBudget, 10) : null;
    if (moveInDate !== undefined) tenantData.moveInDate = moveInDate ? new Date(moveInDate) : null;
    if (roomType !== undefined) tenantData.roomType = roomType;
    if (furnishingPreference !== undefined) tenantData.furnishingPreference = furnishingPreference;
    if (occupation !== undefined) tenantData.occupation = occupation;
    if (gender !== undefined) tenantData.gender = gender;
    if (genderPreference !== undefined) tenantData.genderPreference = genderPreference;
    if (lifestyle !== undefined) tenantData.lifestyle = lifestyle;
    if (smoking !== undefined) tenantData.smoking = smoking;
    if (pets !== undefined) tenantData.pets = pets;
    if (food !== undefined) tenantData.food = food;
    if (bio !== undefined) tenantData.bio = bio;

    userUpdateData.tenantProfile = {
      upsert: {
        create: tenantData,
        update: tenantData
      }
    };
  }

  return await userRepo.updateUserProfile(userId, userUpdateData);
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    const error = new Error('Both current password and new password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepo.findUserByIdWithPassword(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Incorrect current password');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepo.updateUserPassword(userId, hashedPassword);
  return { message: 'Password updated successfully' };
};

