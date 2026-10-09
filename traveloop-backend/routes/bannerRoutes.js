const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { getBanners, createBanner } = require('../controllers/bannerController');

router.get('/', getBanners);
router.post('/', protect, authorize('admin'), createBanner);

module.exports = router;
