import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiBox } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistItem } from '@/store/slices/wishlistSlice';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { user } = useSelector((state) => state.auth);

  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item) === product._id
  );

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to purchase items');
      navigate('/login');
      return;
    }
    const selectedSize = product.sizes?.[0] || 'M';
    const selectedColor = product.colors?.[0]?.name || 'Standard';

    dispatch(
      addToCart({
        productId: product._id,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      })
    )
      .unwrap()
      .then(() => toast.success(`Added ${product.name} to Bag`))
      .catch((err) => toast.error(err || 'Failed to add item'));
  };

  const currentPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = product.discount || (hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null);

  const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80';
  const hasSecondary = product.images && product.images.length > 1 && Boolean(product.images[1]) && product.images[1] !== displayImage;
  const hoverImage = hasSecondary ? product.images[1] : displayImage;

  return (
    <div
      className="group relative flex flex-col justify-between bg-white rounded-[26px] sm:rounded-[28px] p-2.5 sm:p-3 border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inset Rounded Image Container */}
      <Link
        to={`/shop/${product._id}`}
        className="relative aspect-[4/5] w-full rounded-[20px] overflow-hidden bg-[#F6F7F9] block shadow-inner"
      >
        <img
          src={isHovered ? hoverImage : displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Floating 3D Try-On Button (Top-Left) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/try-on?garment=${product.tryOnType || 'tshirt'}&productId=${product._id}`);
          }}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/75 hover:bg-white backdrop-blur-md border border-white/50 flex items-center justify-center text-[#111111] transition-all shadow-sm z-10 active:scale-90"
          title="Try On in 3D"
          aria-label="3D Try On"
        >
          <FiBox className="w-3.5 h-3.5 text-[#FF3F6C]" />
        </button>

        {/* Floating Translucent Wishlist Heart Button (Top-Right) */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/75 hover:bg-white backdrop-blur-md border border-white/50 flex items-center justify-center text-[#282C3F] transition-all shadow-sm z-10 active:scale-90"
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <FiHeart
            className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-[#FF3F6C] text-[#FF3F6C]' : 'text-gray-600'
              }`}
          />
        </button>

        {/* Rating Pill (Bottom-Left) */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/85 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 text-[10px] font-bold text-[#111111] z-10 border border-white/40">
          <span>{product.rating ? Number(product.rating).toFixed(1) : '4.3'}</span>
          <FiStar className="w-2.5 h-2.5 fill-[#14958F] text-[#14958F]" />
        </div>
      </Link>

      {/* Product Content Details (Below Image) */}
      <div className="pt-3 pb-1 px-1 flex flex-col justify-between flex-1">
        <Link to={`/shop/${product._id}`} className="block">
          {/* Product Title */}
          <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate leading-snug group-hover:text-black">
            {product.name}
          </h3>

          {/* Subtitle / Short Description */}
          <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed font-normal">
            {product.description || `${product.brand || 'TryOnVerse'} • ${product.material || 'Premium Fabric'}`}
          </p>
        </Link>

        {/* Bottom Row: Price on Left, "Buy" Pill Button on Right */}
        <div className="flex items-center justify-between mt-3 pt-1 gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-gray-900">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-gray-400 line-through font-normal">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-bold text-[#FF5722]">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Rounded-Full Pill "Buy" Button */}
          <button
            onClick={handleQuickAdd}
            className="px-5 py-1.5 sm:py-2 rounded-full bg-[#1e2029] hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
