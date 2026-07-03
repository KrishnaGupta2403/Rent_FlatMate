const express = require('express');
const router = express.Router();
const ownerController = require('./owner.controller');
const authMiddleware = require('../auth/auth.middleware');
const roleGuard = require('../../middleware/role.middleware');
const upload = require('../uploads/multer');
const { validateCreateListing } = require('./owner.validation');

router.use(authMiddleware, roleGuard(['OWNER']));

router.post('/listings', validateCreateListing, ownerController.createListing);
router.get('/listings', ownerController.getMyListings);
router.post('/listings/:id/photos', upload.array('photos', 5), ownerController.uploadListingPhotos);
router.patch('/listings/:id', ownerController.editListing);
router.patch('/listings/:id/fill', ownerController.markAsFilled);
router.delete('/listings/:id', ownerController.deleteListing);

module.exports = router;
