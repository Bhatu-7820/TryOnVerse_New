const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
