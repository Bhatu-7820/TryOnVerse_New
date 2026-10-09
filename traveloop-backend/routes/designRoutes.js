const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  saveDesign,
  getMyDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
  requestQuote
} = require('../controllers/designController');

router.use(protect);

router.post('/', saveDesign);
router.get('/my-designs', getMyDesigns);
router.get('/:id', getDesignById);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);
router.post('/:id/quote', requestQuote);

module.exports = router;
