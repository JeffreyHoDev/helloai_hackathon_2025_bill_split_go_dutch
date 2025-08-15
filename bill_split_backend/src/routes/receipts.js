const express = require('express');
const router = express.Router();
const { getAllReceipts, createReceipt, getReceipt, updateReceipt, deleteReceipt } = require('../controllers/receiptController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', verifyFirebaseToken, getAllReceipts);
router.post('/', verifyFirebaseToken, upload.array('images', 10), createReceipt);
router.get('/:receiptId', verifyFirebaseToken, getReceipt);
router.put('/:receiptId', verifyFirebaseToken, updateReceipt);
router.delete('/:receiptId', verifyFirebaseToken, deleteReceipt);

module.exports = router;
