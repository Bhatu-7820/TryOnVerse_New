const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');

router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.post('/move-to-cart/:productId', moveToCart);

module.exports = router;
