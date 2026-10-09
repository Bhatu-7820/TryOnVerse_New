import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlistItem } from '@/store/slices/wishlistSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import { wishlistService } from '@/services/wishlistService';
import { FiHeart, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  const handleRemove = (productId) => {
    dispatch(toggleWishlistItem(productId));
    toast.success('Removed from wishlist');
  };

  const handleMoveToCart = async (product) => {
    try {
      const defaultSize = product.sizes?.[0] || 'M';
      const defaultColor = product.colors?.[0]?.name || 'Standard';

      await wishlistService.moveToCart(product._id, defaultSize, defaultColor);
      dispatch(fetchWishlist());
      dispatch(fetchCart());
      toast.success(`Moved ${product.name} to Bag!`);
    } catch (err) {
      toast.error('Failed to move item to bag');
    }
  };

  if (!user) {
    return (
      <div className="fashion-container py-24 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F6] text-[#282C3F]">
          <FiHeart className="w-8 h-8 text-[#7E818C]" />
        </div>
        <h2 className="text-xl font-bold text-[#111111] uppercase tracking-wide">Please Log In</h2>
        <p className="text-xs text-[#7E818C] max-w-sm mx-auto">
          Login to view items in your wishlist and move them to bag easily.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider rounded-[3px] hover:bg-black transition-colors"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="fashion-container py-24 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F6] text-[#282C3F]">
          <FiHeart className="w-8 h-8 text-[#7E818C]" />
        </div>
        <h2 className="text-xl font-bold text-[#111111] uppercase tracking-wide">Your Wishlist is Empty</h2>
        <p className="text-xs text-[#7E818C] max-w-sm mx-auto">
          Explore items and tap the heart icon to save your favorite styles here.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider rounded-[3px] hover:bg-[#E0355D] transition-colors"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6 bg-white">
      <div className="border-b border-[#EAEAEC] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#111111]">
          My Wishlist <span className="font-normal text-sm text-[#7E818C]">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((prod) => {
          const product = prod.name ? prod : prod.product || {};
          if (!product._id) return null;

          const currentPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
          const originalPrice = product.price;
          const hasDiscount = product.salePrice && product.salePrice < product.price;

          return (
            <div
              key={product._id}
              className="border border-[#EAEAEC] rounded-[4px] overflow-hidden bg-white hover:shadow-card-hover transition-shadow flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] bg-[#F5F5F6] overflow-hidden">
                <Link to={`/shop/${product._id}`}>
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#7E818C] hover:text-[#111111] flex items-center justify-center shadow-subtle z-10"
                  title="Remove from Wishlist"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide text-[#111111] truncate">
                    {product.brand || 'TRYONVERSE'}
                  </h3>
                  <p className="text-xs text-[#535665] truncate font-normal mt-0.5">
                    {product.name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="font-bold text-sm text-[#111111]">
                      ₹{currentPrice?.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-[#7E818C] line-through">
                        ₹{originalPrice?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F5F5F6]">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full py-2 bg-white border border-[#D4D5D9] hover:border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white font-bold text-xs uppercase tracking-wider rounded-[3px] transition-colors"
                  >
                    MOVE TO BAG
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
