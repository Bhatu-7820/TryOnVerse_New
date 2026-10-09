const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createPaymentIntent, verifyPayment, simulatePayment } = require('../controllers/paymentController');

router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/verify', verifyPayment);
router.post('/simulate', simulatePayment);

module.exports = router;
