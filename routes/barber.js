const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const BarberController = require('../controllers/BarberController');

router.post('/create_barber', verifyToken, authorizeManager, BarberController.createBarber);
router.delete('/delete_barber/:id', verifyToken, authorizeManager, BarberController.deleteBarber);
router.put('/update_barber/:id', verifyToken, authorizeManager, BarberController.updateBarber);

module.exports = router;