const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const upload = require('./multer');
const authMiddleware = require('../auth/auth.middleware');

router.use(authMiddleware);
router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
