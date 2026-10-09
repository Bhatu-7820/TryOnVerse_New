const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
