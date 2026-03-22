const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId;
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'unknown product'}` });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        weight: product.weight,
        quantity: item.quantity
      });
    }

    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalAmount
    });

    await order.save();
    // Clear cart but keep items as snapshots in order
    await Cart.findOneAndDelete({ userId: req.user._id });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    console.log("Fetching Admin Stats...");
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });

    const stats = {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalProducts,
      lowStockProducts
    };
    console.log("Admin Stats Result:", stats);
    res.json(stats);
  } catch (err) {
    console.error("Error in getAdminStats:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getTodayStats = async (req, res) => {
  try {
    console.log("Fetching Today's Stats...");
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    // Use the next day to ensure we cover the full current day
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    console.log(`Filtering orders from ${startOfToday.toISOString()} to ${endOfToday.toISOString()}`);

    const todayOrders = await Order.find({ 
      createdAt: { 
        $gte: startOfToday,
        $lt: endOfToday
      } 
    }).populate('userId', 'name email');
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const uniqueCustomers = [...new Set(todayOrders.map(o => o.userId?._id?.toString()).filter(id => id))].length;

    const totalProducts = await Product.countDocuments();
    const totalLifetimeRevenueAggregate = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const totalLifetimeRevenue = totalLifetimeRevenueAggregate[0]?.total || 0;

    const stats = {
      todayRevenue,
      todayCustomerCount: uniqueCustomers,
      totalProducts, // Added here as requested by user's "Expected" output
      totalRevenue: totalLifetimeRevenue, // Added here as requested by user's "Expected" output
      todayOrders: todayOrders.map(o => ({
        _id: o._id,
        customerName: o.userId?.name || 'Guest',
        time: o.createdAt,
        totalAmount: o.totalAmount,
        items: o.items
      }))
    };
    
    console.log("Today's Stats Result:", { 
      orderCount: todayOrders.length, 
      revenue: todayRevenue, 
      customers: uniqueCustomers 
    });
    
    res.json(stats);
  } catch (err) {
    console.error("Error in getTodayStats:", err);
    res.status(500).json({ message: err.message });
  }
};
