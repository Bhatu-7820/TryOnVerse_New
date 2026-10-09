const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }
    res.status(200).json({ success: true, data: wishlist.products });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [] });
    }

    if (!wishlist.products.map(p => p.toString()).includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products');
    res.status(200).json({ success: true, data: wishlist.products });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(200).json({ success: true, data: [] });

    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products');

    res.status(200).json({ success: true, data: wishlist.products });
  } catch (err) {
    next(err);
  }
};

exports.moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { size = 'M', color = 'Default' } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 1. Remove from Wishlist
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
    }

    // 2. Add to Cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    cart.items.push({
      product: product._id,
      size,
      color,
      quantity: 1,
      price
    });

    let subtotal = 0;
    cart.items.forEach(it => { subtotal += it.price * it.quantity; });
    cart.subtotal = subtotal;
    cart.total = subtotal;
    await cart.save();

    res.status(200).json({ success: true, message: 'Moved to cart successfully' });
  } catch (err) {
    next(err);
  }
};
