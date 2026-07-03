const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../auth/auth.middleware');
const roleGuard = require('../../middleware/role.middleware');

router.use(authMiddleware, roleGuard(['ADMIN']));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/listings', adminController.listListings);
router.delete('/listings/:id', adminController.removeListing);
router.patch('/listings/:id/spam', adminController.markSpam);

module.exports = router;
