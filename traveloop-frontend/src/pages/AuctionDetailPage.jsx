import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionService } from '@/services/auctionService';
import { useSocket } from '@/hooks/useSocket';
import { useSelector } from 'react-redux';
import { FiClock, FiShield, FiUser, FiBox, FiCheckCircle, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing] = useState(false);

  // Live Timer
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, ended: false });

  useEffect(() => {
    auctionService.getAuction(id)
      .then((res) => {
        if (res.data) {
          setAuction(res.data);
          setBids(res.bids || []);
          const minAllowed = res.data.currentPrice + (res.data.minBidIncrement || 100);
          setBidAmount(minAllowed);
        }
      })
      .catch(() => toast.error('Failed to load auction drop'))
      .finally(() => setLoading(false));
  }, [id]);

  // Socket.IO updates
  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentPrice: data.currentPrice,
            bidsCount: data.bidsCount,
            winner: data.winner,
          };
        });
        setBids((prev) => [data.bid, ...prev]);
        setBidAmount(data.currentPrice + (auction?.minBidIncrement || 100));
        toast.success(`New Bid Placed: ₹${data.currentPrice.toLocaleString('en-IN')}`);
      }
    };

    socket.on('auction_bid_update', handleBidUpdate);
    return () => socket.off('auction_bid_update', handleBidUpdate);
  }, [socket, id, auction]);

  // Countdown timer
  useEffect(() => {
    if (!auction?.endTime) return;
    const update = () => {
      const diff = new Date(auction.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, ended: true });
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ h, m, s, ended: false });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to place a bid');
      return;
    }
    const val = Number(bidAmount);
    const minRequired = auction.currentPrice + (auction.minBidIncrement || 100);
    if (val < minRequired) {
      toast.error(`Minimum acceptable bid is ₹${minRequired.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setPlacing(true);
      const res = await auctionService.placeBid(id, val);
      toast.success(res.message || 'Bid accepted by server!');
      // Update local state immediately if needed
      setAuction((prev) => ({
        ...prev,
        currentPrice: val,
        bidsCount: (prev.bidsCount || 0) + 1,
      }));
      setBidAmount(val + (auction.minBidIncrement || 100));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Bid rejected');
    } finally {
      setPlacing(false);
    }
  };

  const handleQuickIncrement = (inc) => {
    const current = Number(bidAmount) || (auction.currentPrice + (auction.minBidIncrement || 100));
    setBidAmount(current + inc);
  };

  if (loading) {
    return (
      <div className="fashion-container py-12 text-center">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#7E818C] uppercase tracking-wider font-semibold">Loading Runway Auction...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="fashion-container py-12 text-center">
        <h2 className="text-lg font-bold text-[#111111]">Auction Not Found</h2>
        <Link to="/auctions" className="mt-4 inline-block text-xs font-bold text-[#FF3F6C] underline">
          Back to Auctions
        </Link>
      </div>
    );
  }

  const item = auction.itemDetails || auction.product || {};
  const image = auction.itemDetails?.image || auction.product?.images?.[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80';
  const sellerName = auction.seller?.name || auction.sellerName || 'Archive Atelier';
  const category = item.category || 'Runway Archive';
  const condition = item.condition || 'Pristine Runway Sample';
  const minRequired = auction.currentPrice + (auction.minBidIncrement || 100);
  const isEnded = auction.status === 'ENDED' || timeLeft.ended;

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6 bg-white">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <Link to="/auctions" className="hover:text-[#111111]">Auctions</Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold truncate max-w-xs">{auction.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/5] bg-[#F5F5F6] rounded-2xl overflow-hidden border border-[#EAEAEC] relative shadow-sm">
            <img
              src={image}
              alt={auction.title}
              className="w-full h-full object-cover object-top"
            />
            {/* Live Drop Badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`w-2.5 h-2.5 rounded-full ${isEnded ? 'bg-gray-400' : 'bg-[#FF3F6C] animate-pulse'}`} />
              <span className={isEnded ? 'text-gray-500' : 'text-[#FF3F6C]'}>
                {isEnded ? 'Auction Ended' : 'Live Drop'}
              </span>
            </div>
          </div>

          {/* Quick Try-On Button if garment category */}
          <Link
            to={`/try-on?garment=jacket&custom=true`}
            className="w-full py-3 rounded-xl border border-gray-300 hover:border-black bg-white text-[#111111] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
          >
            <FiBox className="text-[#FF3F6C] text-base" /> Try On in 3D Interactive Stage
          </Link>
        </div>

        {/* Right: Bidding Controls & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border-b border-[#EAEAEC] pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-[#FF3F6C] tracking-wider px-2 py-0.5 rounded bg-pink-50">
                {category}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {condition}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111111] leading-snug">
              {auction.title}
            </h1>
            <p className="text-xs text-[#696B79] leading-relaxed">
              {item.description || 'Exclusive collector runway piece open for real-time community bidding.'}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-600">
              <FiUser className="text-gray-400" />
              <span>Listed by: <strong className="text-black">{sellerName}</strong></span>
            </div>
          </div>

          {/* Current Bid & Timer Panel */}
          <div className="p-5 border border-[#EAEAEC] rounded-2xl bg-[#FAFAFA] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#7E818C] block">Current Highest Bid</span>
                <strong className="text-3xl text-[#111111] font-black">
                  ₹{auction.currentPrice?.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7E818C] block">Min Increment</span>
                <span className="text-xs font-bold text-[#282C3F]">
                  +₹{(auction.minBidIncrement || 100)?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAEAEC] flex items-center justify-between text-xs">
              <span className="text-[#7E818C] flex items-center gap-1.5">
                <FiClock className="w-4 h-4 text-[#FF3F6C]" /> Time Remaining:
              </span>
              {isEnded ? (
                <span className="text-[#D32F2F] font-bold">CONCLUDED</span>
              ) : (
                <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#111111]">
                  <span className="bg-white border border-[#EAEAEC] px-2 py-0.5 rounded-[4px]">{String(timeLeft.h).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="bg-white border border-[#EAEAEC] px-2 py-0.5 rounded-[4px]">{String(timeLeft.m).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="bg-white border border-[#EAEAEC] px-2 py-0.5 rounded-[4px]">{String(timeLeft.s).padStart(2, '0')}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Bid Submission Form */}
          {!isEnded ? (
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Enter Your Bid Amount
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-base text-[#7E818C]">₹</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minRequired}
                      step={auction.minBidIncrement || 100}
                      className="w-full h-12 pl-8 pr-4 border border-[#D4D5D9] rounded-xl text-base font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={placing}
                    className="px-8 h-12 bg-[#FF3F6C] hover:bg-[#E0355D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {placing ? 'Submitting...' : 'PLACE BID NOW'}
                  </button>
                </div>
              </div>

              {/* Quick Bid Increment Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-gray-500 font-medium">Quick Add:</span>
                {[100, 500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickIncrement(amt)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-800 transition"
                  >
                    +₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[#7E818C] flex items-center gap-1">
                <FiShield className="text-emerald-600" />
                Next valid bid must be at least ₹{minRequired.toLocaleString('en-IN')}. Bids are authenticated and broadcast live.
              </p>
            </form>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900 font-semibold space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-800">
                <FiCheckCircle /> Auction Concluded
              </div>
              <p>
                Winner:{' '}
                <strong className="text-black">{auction.winner?.name || 'Top Bidder'}</strong> with a winning bid of{' '}
                <strong className="text-black">₹{auction.currentPrice?.toLocaleString('en-IN')}</strong>.
              </p>
            </div>
          )}

          {/* Bid History Table */}
          <div className="space-y-3 pt-4 border-t border-[#EAEAEC]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center justify-between">
              <span>Live Bid Activity</span>
              <span className="text-gray-400 font-normal">({bids.length} {bids.length === 1 ? 'Bid' : 'Bids'})</span>
            </h3>

            {bids.length === 0 ? (
              <p className="text-xs text-[#7E818C] py-2 bg-gray-50 text-center rounded-lg border border-dashed">
                No bids placed yet. Place the opening bid to lead this auction!
              </p>
            ) : (
              <div className="border border-[#EAEAEC] rounded-xl divide-y divide-[#F5F5F6] max-h-52 overflow-y-auto">
                {bids.map((b, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-[#7E818C] w-3.5 h-3.5" />
                      <span className="font-semibold text-[#282C3F]">
                        {b.bidder?.name ? b.bidder.name.split(' ')[0] + ' ***' : (b.user?.name ? b.user.name.split(' ')[0] + ' ***' : 'Collector')}
                      </span>
                      {idx === 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          LEADING
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#111111]">₹{b.amount?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
