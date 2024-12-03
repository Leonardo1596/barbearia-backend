const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const AppointmentController = require('../controllers/AppointmentController');

router.post('/create_appointment', verifyToken, authorizeManager, AppointmentController.createAppointment);
router.delete('/delete_appointment/:id', verifyToken, authorizeManager, AppointmentController.deleteAppointment);
router.put('/update_appointment/:id', verifyToken, authorizeManager, AppointmentController.updateAppointment);
router.get('/get_appointement/:barbershopId', verifyToken, authorizeManager, AppointmentController.getAppointmentsByDate);

module.exports = router;