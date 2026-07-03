const express = require('express');
const router = express.Router();
const listingController = require('./listing.controller');
const { validateListingId } = require('./listing.validation');

router.get('/', listingController.getPublicListings);
router.get('/:id', validateListingId, listingController.getPublicListingById);

module.exports = router;
