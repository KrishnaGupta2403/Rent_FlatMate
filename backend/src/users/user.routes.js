const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');
const { validateUpdateProfile } = require('./user.validation');

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.patch('/profile', validateUpdateProfile, userController.updateProfile);
router.patch('/password', userController.changePassword);

module.exports = router;