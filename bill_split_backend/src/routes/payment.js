const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', verifyFirebaseToken, createPaymentIntent);

module.exports = router;
