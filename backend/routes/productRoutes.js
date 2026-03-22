const express = require('express');
const { createProduct, getProducts, getProductByBarcode, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getProducts);
router.get('/barcode/:code', getProductByBarcode);
router.post('/', protect, authorize('staff', 'admin'), createProduct);
router.put('/:id', protect, authorize('staff', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteProduct);

module.exports = router;
