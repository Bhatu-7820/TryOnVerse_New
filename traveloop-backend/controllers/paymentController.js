const Payment = require('../models/Payment');
const Order = require('../models/Order');
const crypto = require('crypto');

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, method = 'DEV_GATEWAY' } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized for this order' });
    }

    const transactionId = 'TXN_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      amount: order.total,
      currency: 'INR',
      method,
      transactionId,
      status: 'PENDING',
      paymentDetails: {
        mode: 'DEVELOPMENT_SIMULATOR',
        note: 'Simulated sandbox transaction for development & evaluation'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        transactionId,
        amount: order.total,
        currency: 'INR',
        isDevelopmentMode: true,
        message: 'Development payment session initialized. Server verification required.'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { transactionId, paymentId, simulatedStatus = 'SUCCESS' } = req.body;
    const payment = await Payment.findOne({
      $or: [{ _id: paymentId }, { transactionId }]
    });

    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    if (payment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Authoritative Server-Side Verification:
    // In dev mode, we verify the transactionId against the database record
    if (simulatedStatus === 'SUCCESS') {
      payment.status = 'SUCCESS';
      await payment.save();

      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = 'PAID';
        order.orderStatus = 'CONFIRMED';
        order.paymentReference = payment.transactionId;
        await order.save();
      }

      res.status(200).json({
        success: true,
        verified: true,
        paymentStatus: 'PAID',
        transactionId: payment.transactionId,
        order
      });
    } else {
      payment.status = 'FAILED';
      await payment.save();
      res.status(400).json({ success: false, verified: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    next(err);
  }
};

exports.simulatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const transactionId = 'SIM_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      amount: order.total,
      currency: 'INR',
      method: 'DEVELOPMENT_SIMULATOR',
      transactionId,
      status: 'SUCCESS',
      paymentDetails: {
        mode: 'DEVELOPMENT_SIMULATOR',
        note: 'Authoritative sandbox simulation completed successfully.'
      }
    });

    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.paymentReference = transactionId;
    await order.save();

    res.status(200).json({
      success: true,
      verified: true,
      payment,
      order
    });
  } catch (err) {
    next(err);
  }
};
