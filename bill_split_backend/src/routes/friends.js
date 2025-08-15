const express = require('express');
// We need to merge the params from the parent router (users)
const router = express.Router({ mergeParams: true });
const { getFriends, addFriend, removeFriend } = require('../controllers/friendController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.get('/', verifyFirebaseToken, getFriends);
router.post('/', verifyFirebaseToken, addFriend);
router.delete('/:friendId', verifyFirebaseToken, removeFriend);

module.exports = router;
