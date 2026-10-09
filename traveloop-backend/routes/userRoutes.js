const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress
} = require('../controllers/userController');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);

module.exports = router;
