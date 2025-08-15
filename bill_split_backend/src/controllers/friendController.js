const admin = require('firebase-admin');

const getFriends = async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden. You can only access your own friends list.' });
  }

  try {
    // Assuming you have a 'users' collection in Firestore
    // and each user document has a 'friends' subcollection.
    const friendsSnapshot = await admin.firestore().collection('users').doc(req.params.userId).collection('friends').get();
    const friends = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(friends);
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ message: 'Error fetching friends list.', error: error.message });
  }
};

const addFriend = async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden. You can only add friends to your own list.' });
  }

  const { friendId, friendData } = req.body; // friendData could include displayName, email, etc.

  if (!friendId) {
    return res.status(400).json({ message: 'friendId is required.' });
  }

  try {
    await admin.firestore().collection('users').doc(req.params.userId).collection('friends').doc(friendId).set(friendData || {});
    res.status(201).json({ message: 'Friend added successfully.' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Error adding friend.', error: error.message });
  }
};

const removeFriend = async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden. You can only remove friends from your own list.' });
  }

  try {
    await admin.firestore().collection('users').doc(req.params.userId).collection('friends').doc(req.params.friendId).delete();
    res.status(200).json({ message: 'Friend removed successfully.' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Error removing friend.', error: error.message });
  }
};

module.exports = { getFriends, addFriend, removeFriend };
