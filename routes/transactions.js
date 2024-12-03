const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const TransactionController = require('../controllers/TransactionController');

router.post('/create_transaction', verifyToken, TransactionController.createTransaction);
router.delete('/delete_transaction/:id', TransactionController.deleteTransaction);

module.exports = router;