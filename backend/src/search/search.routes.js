const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');

router.get('/', searchController.searchListings);
router.get('/listings', searchController.searchListings);

module.exports = router;
