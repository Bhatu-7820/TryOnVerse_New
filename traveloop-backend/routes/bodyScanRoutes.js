const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  saveBodyScan,
  getMyScans,
  getLatestScan,
  getProductSizeRecommendation
} = require('../controllers/bodyScanController');

router.get('/recommendation/:productId', protect, getProductSizeRecommendation);
router.post('/', protect, saveBodyScan);
router.post('/save', protect, saveBodyScan);
router.get('/my-scans', protect, getMyScans);
router.get('/latest', protect, getLatestScan);

module.exports = router;
