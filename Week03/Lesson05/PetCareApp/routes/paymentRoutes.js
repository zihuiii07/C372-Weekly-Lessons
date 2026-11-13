// *changes: new file - payment routes for L5 (no login needed, classroom mock only)
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/payments/prepare/:serviceId', paymentController.preparePayment);

module.exports = router;
