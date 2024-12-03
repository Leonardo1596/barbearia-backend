const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeManager = require('../middlewares/authorizeManager');
const ProductController = require('../controllers/ProductController');

router.post('/create_product', verifyToken, authorizeManager, ProductController.createProduct);
router.get('/products/:barbershop', verifyToken, authorizeManager, ProductController.getProducts);
router.delete('/delete_product/:id', verifyToken, authorizeManager, ProductController.deleteProduct);
router.put('/update_product/:id', verifyToken, authorizeManager, ProductController.updateProduct);

module.exports = router;