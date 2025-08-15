const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.get('/', verifyFirebaseToken, getAllUsers);
router.get('/:userId', verifyFirebaseToken, getUser);
router.put('/:userId', verifyFirebaseToken, updateUser);
router.delete('/:userId', verifyFirebaseToken, deleteUser);

module.exports = router;
