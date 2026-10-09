const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerName: { type: String, default: 'Independent Fashion Creator' },
  itemDetails: {
    name: { type: String },
    description: { type: String },
    category: { type: String, default: 'Streetwear' },
    condition: { type: String, default: 'Brand New' },
    image: { type: String },
    size: { type: String, default: 'M' },
    color: { type: String },
    brand: { type: String, default: 'Custom Atelier' }
  },
  startingPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, required: true, min: 0 },
  minBidIncrement: { type: Number, default: 100, min: 10 },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winningBid: { type: Number },
  bidsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);

