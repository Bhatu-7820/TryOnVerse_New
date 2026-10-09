const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const Product = require('../models/Product');

exports.getActiveAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find()
      .populate('product')
      .populate('seller', 'name email avatar')
      .populate('winner', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: auctions });
  } catch (err) {
    next(err);
  }
};

exports.getAuctionById = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('product')
      .populate('seller', 'name email avatar')
      .populate('winner', 'name email');

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // Fetch bid history
    const bids = await Bid.find({ auction: auction._id })
      .populate('bidder', 'name email')
      .sort('-amount')
      .limit(30);

    res.status(200).json({ success: true, data: auction, bids });
  } catch (err) {
    next(err);
  }
};

exports.placeBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const bidAmount = Number(amount);
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ message: 'Valid bid amount is required' });
    }

    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // 1. Authoritative check: Is auction active?
    const now = new Date();
    if (auction.status !== 'ACTIVE' || now > new Date(auction.endTime)) {
      auction.status = 'ENDED';
      await auction.save();
      return res.status(400).json({ message: 'This auction has already ended' });
    }

    if (now < new Date(auction.startTime)) {
      return res.status(400).json({ message: 'This auction has not started yet' });
    }

    // 2. Authoritative check: Minimum required bid
    const minimumAllowed = (auction.bidsCount === 0 && bidAmount >= auction.startingPrice)
      ? auction.startingPrice
      : (auction.currentPrice + auction.minBidIncrement);

    if (bidAmount < minimumAllowed) {
      return res.status(400).json({
        message: `Bid must be at least ₹${minimumAllowed.toLocaleString()} (Min increment: ₹${auction.minBidIncrement})`
      });
    }

    const previousWinner = auction.winner;

    // 3. Atomically record bid and update auction state
    const bid = await Bid.create({
      auction: auction._id,
      user: req.user.id,
      userName: req.user.name || 'Anonymous Collector',
      amount: bidAmount
    });

    auction.currentPrice = bidAmount;
    auction.winner = req.user.id;
    auction.winningBid = bidAmount;
    auction.bidsCount += 1;
    await auction.save();

    await auction.populate('product');
    await auction.populate('winner', 'name email');

    // 4. Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('auction_bid_update', {
        auctionId: auction._id,
        currentPrice: auction.currentPrice,
        bidsCount: auction.bidsCount,
        newBid: bid,
        winner: { id: req.user.id, name: req.user.name }
      });
    }

    // 5. Notify previously winning user that they've been outbid
    if (previousWinner && previousWinner.toString() !== req.user.id) {
      const outbidNotif = await Notification.create({
        userId: previousWinner,
        title: 'You have been outbid!',
        message: `Someone placed a higher bid of ₹${bidAmount.toLocaleString()} on "${auction.title}".`,
        type: 'auction',
        link: `/auctions/${auction._id}`
      });
      if (io) {
        io.to(previousWinner.toString()).emit('new_notification', outbidNotif);
      }
    }

    res.status(200).json({ success: true, data: auction, bid });
  } catch (err) {
    next(err);
  }
};

exports.createAuction = async (req, res, next) => {
  try {
    const {
      productId,
      title,
      startingPrice,
      minBidIncrement = 100,
      startTime,
      endTime,
      durationHours = 48,
      itemDetails
    } = req.body;

    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : new Date(Date.now() + (Number(durationHours) || 48) * 3600 * 1000);

    let productObj = null;
    if (productId) {
      productObj = await Product.findById(productId);
    }

    const startPrice = Number(startingPrice) || (productObj ? productObj.price : 999);

    const auctionData = {
      title: title || (productObj ? `Exclusive Drop: ${productObj.name}` : (itemDetails?.name || 'Exclusive Custom Runway Piece')),
      startingPrice: startPrice,
      currentPrice: startPrice,
      minBidIncrement: Number(minBidIncrement) || 100,
      startTime: start,
      endTime: end,
      status: 'ACTIVE',
      seller: req.user?._id,
      sellerName: req.user?.name || 'Creator Atelier'
    };

    if (productObj) {
      auctionData.product = productObj._id;
    }

    if (itemDetails) {
      auctionData.itemDetails = {
        name: itemDetails.name || title || 'Custom Atelier Creation',
        description: itemDetails.description || 'Limited edition community fashion creation.',
        category: itemDetails.category || 'Streetwear',
        condition: itemDetails.condition || 'Brand New',
        image: itemDetails.image || (productObj?.images?.[0] || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'),
        size: itemDetails.size || 'M',
        color: itemDetails.color || '#111827',
        brand: itemDetails.brand || 'TryOnVerse Atelier'
      };
    } else if (productObj) {
      auctionData.itemDetails = {
        name: productObj.name,
        description: productObj.description,
        category: productObj.category || 'Runway Archive',
        condition: 'Pristine Runway Sample',
        image: productObj.images?.[0],
        size: productObj.sizes?.[0] || 'M',
        color: productObj.colors?.[0]?.hex || '#111827',
        brand: productObj.brand || 'TryOnVerse Couture'
      };
    }

    const auction = await Auction.create(auctionData);

    if (auction.product) {
      await auction.populate('product');
    }
    if (auction.seller) {
      await auction.populate('seller', 'name email avatar');
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new_auction', auction);
    }

    res.status(201).json({ success: true, data: auction });
  } catch (err) {
    next(err);
  }
};

exports.closeAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('winner', 'name email');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    auction.status = 'ENDED';
    await auction.save();

    if (auction.winner) {
      const winNotif = await Notification.create({
        userId: auction.winner._id,
        title: '🎉 Congratulations! You won the auction!',
        message: `You won "${auction.title}" with a final bid of ₹${auction.winningBid?.toLocaleString()}.`,
        type: 'auction',
        link: `/auctions/${auction._id}`
      });
      const io = req.app.get('io');
      if (io) {
        io.to(auction.winner._id.toString()).emit('new_notification', winNotif);
      }
    }

    res.status(200).json({ success: true, data: auction });
  } catch (err) {
    next(err);
  }
};
