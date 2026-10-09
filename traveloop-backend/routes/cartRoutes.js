const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/add', addToCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateQuantity);
router.delete('/items/:itemId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
