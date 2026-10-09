const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getActiveAuctions,
  getAuctionById,
  placeBid,
  createAuction,
  closeAuction
} = require('../controllers/auctionController');

router.get('/', getActiveAuctions);
router.get('/:id', getAuctionById);

router.post('/:id/bid', protect, placeBid);
router.post('/', protect, createAuction);
router.put('/:id/close', protect, closeAuction);

module.exports = router;
