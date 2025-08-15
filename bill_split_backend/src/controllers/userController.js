const admin = require('firebase-admin');

const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching all users.', error: error.message });
  }
};

const getUser = async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden. You can only access your own user data.' });
  }

  try {
    const userRecord = await admin.auth().getUser(req.params.userId);
    // Optionally, fetch additional user data from Firestore
    // const userDoc = await admin.firestore().collection('users').doc(req.params.userId).get();
    // if (!userDoc.exists) {
    //   return res.status(404).json({ message: 'User not found in Firestore.' });
    // }
    // const userData = { ...userRecord, ...userDoc.data() };
    res.status(200).json(userRecord);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data.', error: error.message });
  }
};

const updateUser = async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden. You can only update your own user data.' });
  }

  const { displayName } = req.body;

  try {
    const updatedUser = await admin.auth().updateUser(req.params.userId, {
      displayName,
    });
    // Optionally, update user data in Firestore as well
    // await admin.firestore().collection('users').doc(req.params.userId).update({ displayName });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ message: 'Forbidden. You can only delete your own user account.' });
  }

  try {
    await admin.auth().deleteUser(req.params.userId);
    // Optionally, delete user data from Firestore
    // await admin.firestore().collection('users').doc(req.params.userId).delete();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};

module.exports = { getAllUsers, getUser, updateUser, deleteUser };
