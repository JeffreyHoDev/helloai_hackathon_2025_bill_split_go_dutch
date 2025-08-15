
const admin = require('firebase-admin');

const register = async (req, res) => {
  const { email, password, displayName } = req.body;
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!email || !idToken) {
    return res.status(400).json({ message: 'Email and ID token are required.' });
  }

  try {
    // The user is already created on the client-side with Firebase Auth.
    // We just need to verify the token and create the Firestore record.
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Check if user already exists in Firestore to prevent duplicates
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
        // This can happen if the client-side creation succeeded but this backend call failed and was retried.
        // We can just return a success message.
        return res.status(200).json({ uid, message: 'User already exists in Firestore.' });
    }

    // Create a corresponding user document in Firestore
    await userDocRef.set({
      displayName: displayName || email,
      email,
      avatar: `https://ui-avatars.com/api/?name=${(displayName || email).replace(/\s/g, '+')}`
    });

    res.status(201).json({ uid: uid });
  } catch (error) {
    console.error('Error creating new user in backend:', error);
    // If user creation fails on the backend, it's a good idea to delete the user from Auth
    // to allow them to try registering again.
    if (error.code !== 'auth/user-not-found') { // Don't try to delete if we can't find them
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            await admin.auth().deleteUser(decodedToken.uid);
        } catch (deleteError) {
            console.error('Failed to clean up user from Auth after Firestore error:', deleteError);
        }
    }
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

    // If user does not exist in Firestore, create them (e.g., first time Google Sign-In)
    if (!userDoc.exists) {
      const displayName = userRecord.displayName || userRecord.email || 'New User';
      const email = userRecord.email;
      const photoURL = userRecord.photoURL || `https://ui-avatars.com/api/?name=${displayName.replace(/\s/g, '+')}`;
      
      await userDocRef.set({
        displayName: displayName,
        email: email,
        avatar: photoURL,
      });
    }

    res.status(200).json({ message: 'Login successful', uid });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).json({ message: 'Unauthorized. Invalid ID token.', error: error.message });
  }
};

module.exports = { register, login };
