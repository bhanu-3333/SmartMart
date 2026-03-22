const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  const { code } = req.body;
  try {
    console.log("Cart: Adding product with barcode:", code);
    const product = await Product.findOne({ barcode: code });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock <= 0) return res.status(400).json({ message: 'Product out of stock' });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      console.log("Cart: Creating new cart for user:", req.user._id);
      cart = await Cart.create({ userId: req.user._id, items: [{ productId: product._id, quantity: 1 }] });
    } else {
      console.log("Cart: Existing items count:", cart.items.length);
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === product._id.toString());
      
      if (itemIndex > -1) {
        console.log("Cart: Increasing quantity for existing product:", product.name);
        if (cart.items[itemIndex].quantity + 1 > product.stock) {
          return res.status(400).json({ message: 'Cannot add more than available stock' });
        }
        cart.items[itemIndex].quantity += 1;
      } else {
        console.log("Cart: Adding new item to cart:", product.name);
        cart.items.push({ productId: product._id, quantity: 1 });
      }
      // Force markModified if necessary for nested array updates
      cart.markModified('items');
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
