import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auctionService } from '@/services/auctionService';
import { useSelector } from 'react-redux';
import {
  FiClock,
  FiPlus,
  FiTag,
  FiUser,
  FiCheck,
  FiX,
  FiShield,
  FiTrendingUp,
  FiCamera,
  FiImage
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, ended: false });

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
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
  }, [endTime]);

  if (timeLeft.ended) {
    return <span className="text-[#D32F2F] font-bold text-xs uppercase">CONCLUDED</span>;
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#111111]">
      <span className="bg-[#F5F5F6] px-1.5 py-0.5 rounded-[2px]">{String(timeLeft.h).padStart(2, '0')}h</span>
      <span>:</span>
      <span className="bg-[#F5F5F6] px-1.5 py-0.5 rounded-[2px]">{String(timeLeft.m).padStart(2, '0')}m</span>
      <span>:</span>
      <span className="bg-[#F5F5F6] px-1.5 py-0.5 rounded-[2px]">{String(timeLeft.s).padStart(2, '0')}s</span>
    </div>
  );
}

// Preset photo gallery options for fast user selling
const PRESET_PHOTOS = [
  { label: 'Cyberpunk Bomber', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80' },
  { label: 'Vintage Denim', url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80' },
  { label: 'Streetwear Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80' },
  { label: 'Archive Trench', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80' },
  { label: 'Leather Biker', url: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80' },
  { label: 'Silk Slip Dress', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80' }
];

export default function AuctionsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, COMMUNITY, MY_LISTINGS, ENDING_SOON

  // Modal State for Selling Items
  const [showSellModal, setShowSellModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: '',
    description: '',
    category: 'Streetwear',
    condition: 'Brand New with Tags',
    size: 'M',
    color: '#111827',
    startingPrice: '1499',
    minBidIncrement: '100',
    durationHours: '48',
    image: PRESET_PHOTOS[0].url,
    customImageUrl: ''
  });

  // Quick Bid Modal State
  const [quickBidAuction, setQuickBidAuction] = useState(null);
  const [quickBidAmount, setQuickBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = () => {
    setLoading(true);
    auctionService.getAuctions()
      .then((res) => setAuctions(res.data || []))
      .catch(() => toast.error('Failed to load active auctions'))
      .finally(() => setLoading(false));
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to list items for auction');
      navigate('/login');
      return;
    }

    const priceNum = Number(sellForm.startingPrice);
    if (!priceNum || priceNum < 100) {
      toast.error('Please enter a valid starting price (min ₹100)');
      return;
    }

    const finalImage = sellForm.customImageUrl.trim() || sellForm.image;

    try {
      setSubmitting(true);
      const payload = {
        title: sellForm.title,
        startingPrice: priceNum,
        minBidIncrement: Number(sellForm.minBidIncrement) || 100,
        durationHours: Number(sellForm.durationHours) || 48,
        itemDetails: {
          name: sellForm.title,
          description: sellForm.description,
          category: sellForm.category,
          condition: sellForm.condition,
          size: sellForm.size,
          color: sellForm.color,
          image: finalImage,
          brand: user.name ? `${user.name}'s Atelier` : 'Independent Creator'
        }
      };

      const res = await auctionService.createAuction(payload);
      toast.success('Your item is now live on auction!');
      setShowSellModal(false);
      // Reset form
      setSellForm({
        title: '',
        description: '',
        category: 'Streetwear',
        condition: 'Brand New with Tags',
        size: 'M',
        color: '#111827',
        startingPrice: '1499',
        minBidIncrement: '100',
        durationHours: '48',
        image: PRESET_PHOTOS[0].url,
        customImageUrl: ''
      });
      // Refresh list and focus tab
      if (res.data) {
        setAuctions((prev) => [res.data, ...prev]);
        setActiveTab('MY_LISTINGS');
      } else {
        fetchAuctions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to list auction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickBid = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to place a bid');
      navigate('/login');
      return;
    }
    const val = Number(quickBidAmount);
    const minRequired = quickBidAuction.currentPrice + (quickBidAuction.minBidIncrement || 100);
    if (val < minRequired) {
      toast.error(`Minimum acceptable bid is ₹${minRequired.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setPlacingBid(true);
      const res = await auctionService.placeBid(quickBidAuction._id, val);
      toast.success(res.message || 'Bid successfully recorded!');
      setAuctions((prev) =>
        prev.map((a) =>
          a._id === quickBidAuction._id
            ? { ...a, currentPrice: val, bidsCount: (a.bidsCount || 0) + 1 }
            : a
        )
      );
      setQuickBidAuction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Bid rejected');
    } finally {
      setPlacingBid(false);
    }
  };

  // Filtered auctions based on active tab
  const filteredAuctions = auctions.filter((auction) => {
    const isUserListing = Boolean(auction.seller || auction.itemDetails);
    const isMyListing = user && (auction.seller?._id === user._id || auction.seller === user._id);

    if (activeTab === 'COMMUNITY') {
      return isUserListing;
    }
    if (activeTab === 'MY_LISTINGS') {
      return isMyListing;
    }
    if (activeTab === 'ENDING_SOON') {
      const diff = new Date(auction.endTime).getTime() - Date.now();
      return diff > 0 && diff < 24 * 3600 * 1000;
    }
    return true;
  });

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6 bg-white min-h-[80vh]">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold">Auctions & Drops</span>
      </nav>

      {/* Hero Header with Sell Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3F6C] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#111111]">
              Runway Drops & Live Community Auctions
            </h1>
          </div>
          <p className="text-xs text-[#7E818C] mt-1 max-w-2xl">
            Bid on exclusive 1-of-1 archive runway pieces and bespoke community creations, or list your own custom pieces to sell to fashion collectors.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              toast.error('Please sign in to list items for auction');
              navigate('/login');
            } else {
              setShowSellModal(true);
            }
          }}
          className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <FiPlus className="text-sm" /> Sell Your Item / Start Auction
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100">
        {[
          { id: 'ALL', label: `All Drops (${auctions.length})` },
          { id: 'COMMUNITY', label: 'Community Listings' },
          { id: 'MY_LISTINGS', label: 'My Listed Items' },
          { id: 'ENDING_SOON', label: 'Ending Soon' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Auction Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-[#F5F5F6] animate-pulse rounded-2xl border border-[#EAEAEC]" />
          ))}
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="py-20 text-center border border-[#EAEAEC] rounded-2xl bg-[#FAFAFA] space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-[#111111] flex items-center justify-center mx-auto text-xl">
            <FiTag />
          </div>
          <div>
            <h2 className="font-bold text-base text-[#111111]">No Auctions In This Category</h2>
            <p className="text-xs text-[#7E818C] max-w-sm mx-auto mt-1">
              {activeTab === 'MY_LISTINGS'
                ? "You haven't listed any items yet. Start your first auction now!"
                : 'Check back soon for new community releases and runway drops.'}
            </p>
          </div>
          <button
            onClick={() => setShowSellModal(true)}
            className="px-6 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition"
          >
            List an Item Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => {
            const item = auction.itemDetails || auction.product || {};
            const img = auction.itemDetails?.image || auction.product?.images?.[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80';
            const seller = auction.seller?.name || auction.sellerName || 'Atelier Vault';
            const isEnded = auction.status === 'ENDED';
            const minNextBid = auction.currentPrice + (auction.minBidIncrement || 100);

            return (
              <div
                key={auction._id}
                className="border border-[#EAEAEC] rounded-2xl bg-white overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Image & Status Tag */}
                <div className="relative aspect-[4/5] bg-[#F5F5F6] overflow-hidden">
                  <Link to={`/auctions/${auction._id}`}>
                    <img
                      src={img}
                      alt={auction.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-[10px] font-bold uppercase">
                    <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-[#7E818C]' : 'bg-[#FF3F6C] animate-pulse'}`} />
                    <span className={isEnded ? 'text-[#7E818C]' : 'text-[#FF3F6C]'}>
                      {isEnded ? 'ENDED' : 'LIVE DROP'}
                    </span>
                  </div>

                  {item.condition && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold text-gray-800">
                      {item.condition}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#7E818C]">
                      <span className="font-extrabold uppercase tracking-wider truncate max-w-[150px]">
                        {item.brand || 'TryOnVerse'}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[130px]">
                        <FiUser className="text-gray-400" /> {seller}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#111111] mt-1 line-clamp-1 group-hover:text-black">
                      {auction.title}
                    </h3>
                  </div>

                  {/* Pricing and Timer Info */}
                  <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#EAEAEC] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#7E818C] block text-[10px] uppercase font-bold tracking-wider">Current Bid</span>
                        <strong className="text-base font-extrabold text-[#111111]">
                          ₹{auction.currentPrice?.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[#7E818C] block text-[10px] uppercase font-bold tracking-wider">Total Bids</span>
                        <strong className="text-xs text-[#282C3F] font-bold">{auction.bidsCount || 0} Placed</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EAEAEC] flex items-center justify-between text-xs">
                      <span className="text-[#7E818C] flex items-center gap-1 text-[11px]">
                        <FiClock className="w-3.5 h-3.5 text-[#FF3F6C]" /> Ends:
                      </span>
                      <CountdownTimer endTime={auction.endTime} />
                    </div>
                  </div>

                  {/* Actions: Quick Bid + Full Detail View */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!isEnded ? (
                      <button
                        onClick={() => {
                          setQuickBidAuction(auction);
                          setQuickBidAmount(minNextBid);
                        }}
                        className="py-2.5 text-center bg-[#FF3F6C] hover:bg-[#E0355D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm active:scale-95"
                      >
                        Quick Bid
                      </button>
                    ) : (
                      <div className="py-2.5 text-center bg-gray-100 text-gray-500 font-bold text-xs uppercase rounded-xl">
                        Concluded
                      </div>
                    )}

                    <Link
                      to={`/auctions/${auction._id}`}
                      className="py-2.5 text-center bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm active:scale-95 block"
                    >
                      Details & History
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── SELL YOUR ITEM MODAL ─── */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">List Your Item For Live Auction</h3>
                <p className="text-xs text-gray-500">Sell your custom creations, streetwear drops, or archive fashion pieces.</p>
              </div>
              <button
                onClick={() => setShowSellModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateAuction} className="space-y-4">
              {/* Item Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Piece Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1-of-1 Custom Embroidered Bomber Jacket"
                  value={sellForm.title}
                  onChange={(e) => setSellForm({ ...sellForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Category
                  </label>
                  <select
                    value={sellForm.category}
                    onChange={(e) => setSellForm({ ...sellForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Streetwear">Streetwear</option>
                    <option value="Runway Archive">Runway Archive</option>
                    <option value="Luxury Outerwear">Luxury Outerwear</option>
                    <option value="Custom Atelier">Custom Atelier Design</option>
                    <option value="Sneakers">Sneakers & Footwear</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Condition
                  </label>
                  <select
                    value={sellForm.condition}
                    onChange={(e) => setSellForm({ ...sellForm, condition: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Brand New with Tags">Brand New with Tags</option>
                    <option value="Pristine Runway Sample">Pristine Runway Sample</option>
                    <option value="Mint Condition">Mint Condition</option>
                    <option value="Gently Worn Collector Piece">Gently Worn</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Starting Bid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    placeholder="1499"
                    value={sellForm.startingPrice}
                    onChange={(e) => setSellForm({ ...sellForm, startingPrice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Min Increment (₹)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={sellForm.minBidIncrement}
                    onChange={(e) => setSellForm({ ...sellForm, minBidIncrement: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Duration
                  </label>
                  <select
                    value={sellForm.durationHours}
                    onChange={(e) => setSellForm({ ...sellForm, durationHours: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-black bg-white"
                  >
                    <option value="12">12 Hours (Flash)</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="48">48 Hours (2 Days)</option>
                    <option value="72">3 Days</option>
                    <option value="168">7 Days (Full Week)</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Select Visual Showcase Photo or Provide URL
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSellForm({ ...sellForm, image: p.url, customImageUrl: '' })}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                        sellForm.image === p.url && !sellForm.customImageUrl
                          ? 'border-black scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or paste custom image link (https://...)"
                  value={sellForm.customImageUrl}
                  onChange={(e) => setSellForm({ ...sellForm, customImageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-black mt-1"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Item Provenance / Story
                </label>
                <textarea
                  rows="3"
                  placeholder="Detail the materials, tailoring craft, and unique collector backstory of this piece..."
                  value={sellForm.description}
                  onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-black"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                >
                  {submitting ? 'Publishing Drop...' : 'Launch Live Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── QUICK BID MODAL ─── */}
      {quickBidAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Place Quick Bid</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{quickBidAuction.title}</p>
              </div>
              <button
                onClick={() => setQuickBidAuction(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 block">Current High Bid</span>
                <strong className="text-base font-extrabold text-black">
                  ₹{quickBidAuction.currentPrice?.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">Min Valid Bid</span>
                <span className="font-bold text-[#FF3F6C]">
                  ₹{(quickBidAuction.currentPrice + (quickBidAuction.minBidIncrement || 100))?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickBid} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Your Bid Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-base text-gray-400">₹</span>
                  <input
                    type="number"
                    required
                    min={quickBidAuction.currentPrice + (quickBidAuction.minBidIncrement || 100)}
                    step={quickBidAuction.minBidIncrement || 100}
                    value={quickBidAmount}
                    onChange={(e) => setQuickBidAmount(e.target.value)}
                    className="w-full h-11 pl-8 pr-4 border border-gray-300 rounded-xl text-base font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Quick increment pills */}
              <div className="flex gap-2">
                {[100, 500, 1000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => {
                      const cur = Number(quickBidAmount) || (quickBidAuction.currentPrice + (quickBidAuction.minBidIncrement || 100));
                      setQuickBidAmount(cur + inc);
                    }}
                    className="flex-1 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 border text-xs font-bold text-gray-700 transition"
                  >
                    +₹{inc}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickBidAuction(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={placingBid}
                  className="px-6 py-2 rounded-xl bg-[#FF3F6C] hover:bg-[#E0355D] text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                >
                  {placingBid ? 'Submitting...' : 'Confirm Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
