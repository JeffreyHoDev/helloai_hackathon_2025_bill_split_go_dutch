const admin = require('firebase-admin');

const register = async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Create a corresponding user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      displayName,
      email,
      avatar: `https://i.pravatar.cc/150?u=${userRecord.uid}` // Using a placeholder avatar
    });

    res.status(201).json({ uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).json({ message: 'Error creating new user.', error: error.message });
  }
};

const login = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'ID token is required.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user details from Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    // If user does not exist in Firestore, create them
    if (!userDoc.exists) {
      await userDocRef.set({
        displayName: userRecord.displayName || 'New User',
        email: userRecord.email,
        avatar: userRecord.photoURL || `https://ui-avatars.com/api/?name=${userRecord.displayName || userRecord.email || 'U'}`,
      });
    }

    res.status(200).json({ message: 'Login successful', uid });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).json({ message: 'Unauthorized. Invalid ID token.', error: error.message });
  }
};

module.exports = { register, login };