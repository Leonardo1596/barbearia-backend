const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeAdmin = require('../middlewares/authorizeAdmin');
const BarbershopController = require('../controllers/BarbershopController');

router.post('/create-barbershop', verifyToken, authorizeAdmin, BarbershopController.createBarbershop);

module.exports = router;