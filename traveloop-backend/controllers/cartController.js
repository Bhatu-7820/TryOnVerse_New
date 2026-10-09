const Cart = require('../models/Cart');
const Product = require('../models/Product');

const recalculateCart = (cart) => {
  let subtotal = 0;
  cart.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  cart.subtotal = subtotal;
  cart.total = subtotal;
  return cart;
};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [], subtotal: 0, total: 0 });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, color = 'Default', quantity = 1 } = req.body;
    if (!productId || !size) {
      return res.status(400).json({ message: 'Product ID and size are required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} available.` });
    }

    // Authoritative server-side price check
    const authoritativePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ message: `Cannot add more. Exceeds stock limit of ${product.stock}.` });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = authoritativePrice;
    } else {
      cart.items.push({
        product: product._id,
        size,
        color,
        quantity: Number(quantity),
        price: authoritativePrice
      });
    }

    recalculateCart(cart);
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} units available in stock` });
    }

    item.quantity = quantity;
    // ensure price reflects authoritative product price
    item.price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

    recalculateCart(cart);
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    recalculateCart(cart);
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.total = 0;
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
