const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }
}, { timestamps: true });

bidSchema.index({ auction: 1, amount: -1 });

module.exports = mongoose.model('Bid', bidSchema);
