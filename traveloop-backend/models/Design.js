const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Custom Couture Design' },
  template: {
    type: String,
    enum: ['tshirt', 'hoodie', 'dress', 'jacket'],
    default: 'tshirt'
  },
  baseColor: { type: String, default: '#ffffff' },
  canvasData: { type: mongoose.Schema.Types.Mixed, default: {} },
  previewImage: { type: String },
  status: {
    type: String,
    enum: ['DRAFT', 'SAVED', 'ORDERED', 'REQUEST_QUOTE'],
    default: 'SAVED'
  },
  adminFeedback: { type: String },
  estimatedPrice: { type: Number, default: 2499 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Design', designSchema);
