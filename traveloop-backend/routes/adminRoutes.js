const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteUser,
  getAllDesigns,
  updateDesignStatus,
  getAllScans
} = require('../controllers/adminController');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// All admin routes require authentication and 'admin' role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/designs', getAllDesigns);
router.put('/designs/:id', updateDesignStatus);
router.get('/body-scans', getAllScans);

// Product Management
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
