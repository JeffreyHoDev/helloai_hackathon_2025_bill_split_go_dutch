const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/images', verifyFirebaseToken, upload.array('images', 10), uploadImages);

module.exports = router;
