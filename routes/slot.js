const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const SlotController = require('../controllers/SlotController');

router.get('/available-slots/:barber/:date', verifyToken, authorizeManager, SlotController.getAllAvailableSlots);

module.exports = router;