const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const crypto = require('crypto');

exports.createOrder = async (req, res, next) => {
  try {
    let { items, shippingAddress, paymentMethod = 'DEVELOPMENT_MODE' } = req.body;

    if (!items || !items.length) {
      const userCart = await Cart.findOne({ userId: req.user.id });
      if (userCart && userCart.items && userCart.items.length) {
        items = userCart.items.map(i => ({
          productId: i.product?._id || i.product || i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color
        }));
      }
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ message: 'Valid shipping address is required' });
    }

    // 1. Authoritative Server-Side Validation: Validate each product, stock, and calculate authoritative subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.productId || item.product?._id || item.product;
      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name || prodId}` });
      }

      const qty = Number(item.quantity) || 1;
      if (product.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} units available.`
        });
      }

      const authoritativePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      subtotal += authoritativePrice * qty;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: authoritativePrice,
        quantity: qty,
        size: item.size || 'M',
        color: item.color || 'Standard'
      });
    }

    const shippingFee = subtotal > 1999 ? 0 : 99; // Free shipping above ₹1999
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const orderNumber = 'TOV-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const normalizedAddress = {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone || '+91 9123456789',
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state || 'Maharashtra',
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country || 'India'
    };

    const order = await Order.create({
      orderNumber,
      userId: req.user.id,
      items: validatedItems,
      shippingAddress: normalizedAddress,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'DEVELOPMENT_MODE' ? 'PAID' : 'PENDING',
      orderStatus: paymentMethod === 'DEVELOPMENT_MODE' ? 'CONFIRMED' : 'PENDING',
      paymentReference: 'DEV-TXN-' + crypto.randomBytes(6).toString('hex').toUpperCase()
    });

    // 2. Decrement stock for purchased products
    for (const vItem of validatedItems) {
      await Product.findByIdAndUpdate(vItem.product, { $inc: { stock: -vItem.quantity } });
    }

    // 3. Clear user's cart
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], subtotal: 0, total: 0 });

    // 4. Create user notification
    const notif = await Notification.create({
      userId: req.user.id,
      title: 'Order Placed Successfully!',
      message: `Your order #${order.orderNumber} for ₹${total.toLocaleString()} has been placed.`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id.toString()).emit('new_notification', notif);
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Security check: isolate user's private orders (unless admin)
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You cannot view orders that do not belong to you' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Cannot cancel order in ${order.orderStatus} status` });
    }

    order.orderStatus = 'CANCELLED';
    await order.save();

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
