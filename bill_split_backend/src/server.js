const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const friendsRoutes = require('./routes/friends');
const receiptsRoutes = require('./routes/receipts');
const itemsRoutes = require('./routes/items');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payment');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin SDK initialization
try {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.warn('Firebase Admin SDK initialization failed. Please provide a valid serviceAccountKey.json file.');
  console.warn(error.message);
}

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
usersRoutes.use('/:userId/friends', friendsRoutes); // Nested friends routes
app.use('/api/receipts', receiptsRoutes);
receiptsRoutes.use('/:receiptId/items', itemsRoutes); // Nested items routes
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});