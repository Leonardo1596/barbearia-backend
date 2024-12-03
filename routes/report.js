const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const ReportController = require('../controllers/ReportController');

router.get('/partial-monthly-report/:barbershopId', verifyToken, authorizeManager, ReportController.getFinancialReport);
router.get('/daily-data/:barbershopId', authorizeManager, ReportController.getDailyData);

module.exports = router;