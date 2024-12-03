const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const PaymentController = require('../controllers/Payment');

router.post('/payment/:barbershopId', verifyToken, authorizeManager, PaymentController.processPayment);
router.get('/charges', verifyToken, authorizeManager, PaymentController.getChargeId);
router.post('/refund', verifyToken, authorizeManager, PaymentController.refundPayment);

module.exports = router;