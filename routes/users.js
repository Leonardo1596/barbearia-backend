const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const verifyToken = require('../middlewares/verifyToken');
const authorizeAdmin = require('../middlewares/authorizeAdmin');

router.post('/auth/sign-up', verifyToken, authorizeAdmin, UserController.register);
router.post('/auth/sign-in', UserController.login);
router.put('/updated/user/:userId', UserController.updateUser);
router.get('/get/user/:userId', UserController.getUser);

module.exports = router;