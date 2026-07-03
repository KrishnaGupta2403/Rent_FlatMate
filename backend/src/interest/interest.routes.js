const express = require('express');
const router = express.Router();
const interestController = require('./interest.controller');
const authMiddleware = require('../auth/auth.middleware');
const roleGuard = require('../../middleware/role.middleware');

router.use(authMiddleware);

// Tenant routes
router.post('/', roleGuard(['TENANT']), interestController.sendInterest);
router.post('/:listingId', roleGuard(['TENANT']), interestController.sendInterest);
router.get('/tenant', roleGuard(['TENANT']), interestController.getTenantRequests);
router.patch('/:id/cancel', roleGuard(['TENANT']), interestController.cancelRequest);
router.delete('/:id', roleGuard(['TENANT']), interestController.cancelRequest);

// Owner routes
router.get('/owner', roleGuard(['OWNER']), interestController.getOwnerRequests);
router.patch('/:id/accept', roleGuard(['OWNER']), interestController.acceptRequest);
router.patch('/:id/reject', roleGuard(['OWNER']), interestController.rejectRequest);

module.exports = router;
