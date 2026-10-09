import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartQuantity, removeCartItem } from '@/store/slices/cartSlice';
import { toggleWishlistItem } from '@/store/slices/wishlistSlice';
import { FiTrash2, FiShoppingBag, FiShield, FiTruck, FiRefreshCw, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, subtotal, total, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const handleQtyChange = (itemId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartQuantity({ itemId, quantity: newQty }))
      .unwrap()
      .catch((err) => toast.error(err || 'Failed to update quantity'));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId))
      .unwrap()
      .then(() => toast.success('Item removed from bag'))
      .catch((err) => toast.error(err || 'Failed to remove item'));
  };

  const handleMoveToWishlist = (item) => {
    const prodId = item.productId || item.product?._id || item.product;
    if (prodId) {
      dispatch(toggleWishlistItem(prodId));
      dispatch(removeCartItem(item._id));
      toast.success('Moved to wishlist');
    }
  };

  if (!user) {
    return (
      <div className="fashion-container py-24 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F6] text-[#282C3F]">
          <FiShoppingBag className="w-8 h-8 text-[#7E818C]" />
        </div>
        <h2 className="text-xl font-bold text-[#111111] uppercase tracking-wide">Please Log In</h2>
        <p className="text-xs text-[#7E818C] max-w-sm mx-auto">
          Login to view items in your shopping bag and checkout securely.
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
          <FiShoppingBag className="w-8 h-8 text-[#7E818C]" />
        </div>
        <h2 className="text-xl font-bold text-[#111111] uppercase tracking-wide">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-[#7E818C] max-w-sm mx-auto">
          There are no items in your bag. Explore our collections and add your favorite apparel.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider rounded-[3px] hover:bg-[#E0355D] transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const shippingFee = subtotal > 1999 ? 0 : 99;
  const estimatedTotal = subtotal + shippingFee;

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6 bg-white">
      {/* Title */}
      <div className="border-b border-[#EAEAEC] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#111111]">
          Shopping Bag ({items.length} {items.length === 1 ? 'Item' : 'Items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Delivery perk note */}
          <div className="p-3.5 bg-[#F5F5F6] border border-[#EAEAEC] rounded-[4px] flex items-center justify-between text-xs text-[#282C3F]">
            <div className="flex items-center gap-2">
              <FiTruck className="w-4 h-4 text-[#FF3F6C]" />
              <span>
                {shippingFee === 0 ? 'Complimentary Express Delivery Applied' : 'Add items above ₹1,999 for free delivery'}
              </span>
            </div>
            <span className="font-bold text-[#03A685]">{shippingFee === 0 ? 'FREE' : '₹99'}</span>
          </div>

          <div className="divide-y divide-[#EAEAEC] border border-[#EAEAEC] rounded-[4px] bg-white">
            {items.map((item) => {
              const product = item.product || {};
              const price = item.price || product.price || 0;
              const originalPrice = product.price || price;
              const hasDiscount = originalPrice > price;

              return (
                <div key={item._id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-32 sm:w-28 sm:h-36 bg-[#F5F5F6] rounded-[2px] overflow-hidden shrink-0 border border-[#EAEAEC]">
                    <img
                      src={item.customImage || item.image || product.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80'}
                      alt={item.name || product.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="font-extrabold text-xs uppercase tracking-wide text-[#111111]">
                        {product.brand || 'TRYONVERSE ATELIER'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#535665] font-normal leading-snug mt-0.5">
                        {item.name || product.name}
                      </p>

                      {item.customSummary && (
                        <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold mt-1">
                          {item.customSummary}
                        </p>
                      )}

                      {/* Size and Color tags */}
                      <div className="flex items-center gap-3 text-xs text-[#7E818C] mt-2">
                        <span>Size: <strong className="text-[#111111]">{item.size || 'M'}</strong></span>
                        <span>Color: <strong className="text-[#111111]">{item.color || 'Standard'}</strong></span>
                      </div>
                    </div>

                    {/* Price and Quantity row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F6]">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#111111]">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#7E818C] line-through">
                            ₹{(originalPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#D4D5D9] rounded-[3px]">
                        <button
                          onClick={() => handleQtyChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-1 text-xs font-bold text-[#282C3F] hover:bg-[#F5F5F6] disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-[#111111] border-x border-[#D4D5D9]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#282C3F] hover:bg-[#F5F5F6]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-4 pt-2 text-xs font-bold">
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-[#D32F2F] hover:underline flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        className="text-[#535665] hover:text-[#111111] flex items-center gap-1"
                      >
                        <FiHeart className="w-3.5 h-3.5" /> Move to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-[#EAEAEC] rounded-[4px] p-5 bg-white space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#111111] border-b border-[#EAEAEC] pb-3">
              Price Details ({items.length} {items.length === 1 ? 'Item' : 'Items'})
            </h2>

            <div className="space-y-2.5 text-xs text-[#535665]">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span className="text-[#111111]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className={shippingFee === 0 ? 'text-[#03A685] font-bold' : 'text-[#111111]'}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
            </div>

            <div className="border-t border-[#EAEAEC] pt-3 flex justify-between text-sm font-bold text-[#111111]">
              <span>Total Amount</span>
              <span className="text-base text-[#111111]">
                ₹{estimatedTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-[#FF3F6C] hover:bg-[#E0355D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-[3px] shadow-sm transition-colors active:scale-[0.99]"
            >
              PLACE ORDER
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="border border-[#EAEAEC] rounded-[4px] p-4 bg-[#FAFAFA] space-y-2 text-xs text-[#696B79]">
            <div className="flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#282C3F]" />
              <span>Safe and Secure Payments. 100% Authentic products.</span>
            </div>
            <div className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4 text-[#282C3F]" />
              <span>Easy 14 days returns and exchanges.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
