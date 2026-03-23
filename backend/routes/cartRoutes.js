const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartQuantity } = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('customer'));

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/quantity', updateCartQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
