const express = require('express');
const router = express.Router({ mergeParams: true });
const { createItem, updateItem, deleteItem } = require('../controllers/itemController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.post('/', verifyFirebaseToken, createItem);
router.put('/:itemId', verifyFirebaseToken, updateItem);
router.delete('/:itemId', verifyFirebaseToken, deleteItem);

module.exports = router;
