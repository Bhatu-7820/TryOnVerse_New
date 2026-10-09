const mongoose = require('mongoose');

const bodyScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  measurements: {
    heightCm: { type: Number, required: true },
    chestCm: { type: Number, required: true },
    waistCm: { type: Number, required: true },
    hipsCm: { type: Number, required: true },
    shoulderWidthCm: { type: Number, required: true },
    inseamCm: { type: Number, required: true }
  },
  recommendedSize: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
  confidenceScore: { type: Number, default: 0.88 },
  scanNotes: { type: String, default: 'Computer vision anthropometric estimate from posture landmarks.' },
  isEstimate: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BodyScan', bodyScanSchema);
