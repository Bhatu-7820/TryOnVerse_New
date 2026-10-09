const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  tag: { type: String, default: 'NEW SEASON' },
  image: { type: String, required: true },
  link: { type: String, default: '/shop' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
