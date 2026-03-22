const express = require('express');
const { createOrder, getUserOrders, getAllOrders, getAdminStats, getTodayStats } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getUserOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/today-stats', protect, authorize('admin'), getTodayStats);

module.exports = router;
