const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validateRegister, validateLogin } = require('./auth.validation');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

module.exports = router;
