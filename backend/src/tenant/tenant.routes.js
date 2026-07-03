const express = require('express');
const router = express.Router();
const tenantController = require('./tenant.controller');
const authMiddleware = require('../auth/auth.middleware');
const roleGuard = require('../../middleware/role.middleware');
const { validateUpdatePreferences } = require('./tenant.validation');

router.use(authMiddleware, roleGuard(['TENANT']));

router.get('/preferences', tenantController.getPreferences);
router.patch('/preferences', validateUpdatePreferences, tenantController.updatePreferences);
router.get('/favorites', tenantController.getFavorites);
router.post('/favorites/:listingId', tenantController.addFavorite);
router.delete('/favorites/:listingId', tenantController.removeFavorite);

module.exports = router;
