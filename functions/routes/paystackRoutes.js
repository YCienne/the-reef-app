const express = require('express');
const router = express.Router();
const {
    initializePayment,
    verifyPayment,
    submitOTP,
    checkPaymentStatus
} = require('../controllers/paystackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.post('/submit-otp', protect, submitOTP);
router.get('/status/:reference', protect, checkPaymentStatus);

module.exports = router;
