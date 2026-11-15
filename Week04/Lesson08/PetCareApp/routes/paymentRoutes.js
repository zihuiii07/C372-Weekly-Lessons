// *changes: payment routes - L5 GET prepare + L6 POST mock payment (no login needed, classroom mock only)
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/payments/prepare/:serviceId', paymentController.preparePayment);

// *changes: L6 - POST mock payment route
router.post(
  '/payments/mock/:serviceId',
  paymentController.createMockPayment
);

module.exports = router;
