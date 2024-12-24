const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const ServiceController = require('../controllers/ServiceController');

router.post('/create_service', verifyToken, authorizeManager, ServiceController.createService);
router.delete('/delete_service/:id', verifyToken, authorizeManager, ServiceController.deleteService);
router.put('/update_service/:id', verifyToken, authorizeManager, ServiceController.updateService);
router.get('/get_services/:barbershopId', verifyToken, authorizeManager, ServiceController.getServices);

module.exports = router;