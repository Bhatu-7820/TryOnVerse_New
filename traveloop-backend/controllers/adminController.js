const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Auction = require('../models/Auction');
const Design = require('../models/Design');
const BodyScan = require('../models/BodyScan');
const Category = require('../models/Category');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalDesigns = await Design.countDocuments();
    const totalScans = await BodyScan.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'ACTIVE' });
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } });

    // Calculate total revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const revenue = revenueResult[0]?.totalRevenue || 0;

    // Recent 5 orders
    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('userId', 'name email');

    // Recent 5 users
    const recentUsers = await User.find().select('-password').sort('-createdAt').limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalDesigns,
        totalScans,
        revenue,
        pendingOrders,
        activeAuctions,
        recentOrders,
        recentUsers
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Admin cannot delete themselves' });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getAllDesigns = async (req, res, next) => {
  try {
    const designs = await Design.find().populate('userId', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, data: designs });
  } catch (err) {
    next(err);
  }
};

exports.updateDesignStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback, estimatedPrice } = req.body;

    const design = await Design.findById(id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    if (status) design.status = status;
    if (adminFeedback) design.adminFeedback = adminFeedback;
    if (estimatedPrice) design.estimatedPrice = estimatedPrice;

    await design.save();
    res.status(200).json({ success: true, data: design });
  } catch (err) {
    next(err);
  }
};

exports.getAllScans = async (req, res, next) => {
  try {
    const scans = await BodyScan.find().populate('userId', 'name email').sort('-createdAt').limit(50);
    res.status(200).json({ success: true, data: scans });
  } catch (err) {
    next(err);
  }
};
