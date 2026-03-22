const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('customer'));

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
