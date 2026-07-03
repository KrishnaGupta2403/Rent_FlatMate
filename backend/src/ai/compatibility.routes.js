const express = require('express');
const router = express.Router();
const aiController = require('./compatibility.controller');
const authMiddleware = require('../auth/auth.middleware');
const roleGuard = require('../../middleware/role.middleware');

router.use(authMiddleware, roleGuard(['TENANT', 'OWNER', 'ADMIN']));

router.get('/listings', aiController.getSortedListings);
router.get('/sort/all', aiController.getSortedListings);
router.get('/:listingId', aiController.getListingCompatibility);

router.post('/test-toggle-fail', (req, res) => {
  const gemini = require('./gemini');
  const body = req.body || {};
  gemini.forceFail = Boolean(body.fail);
  return res.status(200).json({ message: 'Force fail toggled', forceFail: gemini.forceFail });
});

module.exports = router;
