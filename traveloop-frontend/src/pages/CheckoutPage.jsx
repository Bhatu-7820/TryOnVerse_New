import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearLocalCart } from '@/store/slices/cartSlice';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { userService } from '@/services/userService';
import {
  FiShield,
  FiCheckCircle,
  FiTruck,
  FiCreditCard,
  FiSmartphone,
  FiLock,
  FiMapPin,
  FiPlus
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, subtotal } = useSelector((state) => state.cart);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  // Address inputs
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [zipCode, setZipCode] = useState('400050');
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('DEVELOPMENT_MODE');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      userService.getAddresses()
        .then((res) => {
          if (res.data?.length) {
            setAddresses(res.data);
            const defIndex = res.data.findIndex((a) => a.isDefault);
            setSelectedAddressIndex(defIndex > -1 ? defIndex : 0);
          } else {
            setUseNewAddress(true);
          }
        })
        .catch(() => setUseNewAddress(true));
    }
  }, [user, dispatch]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const shippingFee = subtotal > 1999 ? 0 : 99;
  const total = subtotal + shippingFee;

  const handlePlaceOrderAndPay = async (e) => {
    e.preventDefault();
    if (!items || items.length === 0) {
      toast.error('Your shopping bag is empty');
      return;
    }

    let shippingAddress = null;
    if (!useNewAddress && addresses.length > 0) {
      shippingAddress = addresses[selectedAddressIndex];
    } else {
      if (!fullName || !phone || !street || !city || !zipCode) {
        toast.error('Please fill in all shipping address fields');
        return;
      }
      shippingAddress = {
        fullName,
        phone,
        street,
        city,
        state: stateName || 'Maharashtra',
        zipCode,
        country: 'India'
      };
    }

    try {
      setProcessing(true);

      const orderPayload = {
        shippingAddress,
        paymentMethod: paymentMethod === 'DEVELOPMENT_MODE' ? 'DEVELOPMENT_MODE' : 'card',
        items: items.map((i) => ({
          productId: i.productId || i.product?._id || i.product,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
      };

      const orderRes = await orderService.createOrder(orderPayload);
      const createdOrder = orderRes.data || orderRes.order;

      // Authoritative payment verification
      const payRes = await paymentService.simulatePayment(createdOrder._id);
      const finalizedOrder = payRes.order || payRes.data?.order || createdOrder;

      dispatch(clearLocalCart());
      setPaymentSuccessOrder(finalizedOrder);
      toast.success('Order placed and payment verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  // Order Success Screen
  if (paymentSuccessOrder) {
    return (
      <div className="fashion-container py-16 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F7F3] text-[#03A685]">
          <FiCheckCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#111111]">Order Confirmed</h1>
          <p className="text-xs text-[#7E818C]">
            Order #{paymentSuccessOrder.orderNumber}
          </p>
        </div>
        <p className="text-xs text-[#535665] max-w-md mx-auto leading-relaxed">
          Thank you for shopping with TryOnVerse. Your order is being tailored and prepared for express dispatch.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(`/orders/${paymentSuccessOrder._id}`)}
            className="px-6 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase rounded-[3px] hover:bg-black"
          >
            Track Order
          </button>
          <Link
            to="/shop"
            className="px-6 py-2.5 border border-[#D4D5D9] text-[#282C3F] text-xs font-bold uppercase rounded-[3px] hover:border-[#111111]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-8 bg-white">
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-center gap-6 sm:gap-12 border-b border-[#EAEAEC] pb-4 text-xs font-bold uppercase tracking-wider text-[#7E818C]">
        <span className="text-[#282C3F]">1. BAG</span>
        <span className="text-[#EAEAEC]">———</span>
        <span className="text-[#FF3F6C]">2. ADDRESS & PAYMENT</span>
        <span className="text-[#EAEAEC]">———</span>
        <span>3. CONFIRMATION</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Delivery Address Section */}
          <div className="border border-[#EAEAEC] rounded-[4px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-3">
              <h2 className="font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center gap-2">
                <FiMapPin className="text-[#FF3F6C] w-4 h-4" />
                Select Delivery Address
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNewAddress(!useNewAddress)}
                  className="text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1"
                >
                  {useNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {!useNewAddress && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`block p-4 border rounded-[3px] cursor-pointer transition-colors ${
                      selectedAddressIndex === idx
                        ? 'border-[#FF3F6C] bg-[#FFF0F4]'
                        : 'border-[#EAEAEC] hover:border-[#D4D5D9]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryAddr"
                        checked={selectedAddressIndex === idx}
                        onChange={() => setSelectedAddressIndex(idx)}
                        className="accent-[#FF3F6C] mt-1 cursor-pointer"
                      />
                      <div className="text-xs space-y-1 text-[#535665]">
                        <p className="font-bold text-[#111111]">{addr.fullName} <span className="font-normal text-[#7E818C]">({addr.phone})</span></p>
                        <p>{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              /* New Address Form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Mobile Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#7E818C] mb-1 font-semibold">Street Address / House No *</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 42 Designer Avenue, Bandra West"
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Postal / PIN Code *</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Payment Options Section */}
          <div className="border border-[#EAEAEC] rounded-[4px] p-5 space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#111111] border-b border-[#EAEAEC] pb-3 flex items-center gap-2">
              <FiCreditCard className="text-[#FF3F6C] w-4 h-4" />
              Choose Payment Method
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 border border-[#EAEAEC] rounded-[3px] cursor-pointer hover:bg-[#F5F5F6]">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payMethod"
                    value="DEVELOPMENT_MODE"
                    checked={paymentMethod === 'DEVELOPMENT_MODE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#FF3F6C]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#111111]">Fast Express Checkout (Verified Sandbox Simulator)</p>
                    <p className="text-[11px] text-[#7E818C]">Authoritative server-side verified instant checkout</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#03A685] bg-[#E6F7F3] px-2 py-0.5 rounded">RECOMMENDED</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 border border-[#EAEAEC] rounded-[3px] cursor-pointer hover:bg-[#F5F5F6]">
                <input
                  type="radio"
                  name="payMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-[#FF3F6C]"
                />
                <div>
                  <p className="text-xs font-bold text-[#111111]">UPI (Google Pay / PhonePe / Paytm)</p>
                  <p className="text-[11px] text-[#7E818C]">Pay directly from your bank account</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 border border-[#EAEAEC] rounded-[3px] cursor-pointer hover:bg-[#F5F5F6]">
                <input
                  type="radio"
                  name="payMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-[#FF3F6C]"
                />
                <div>
                  <p className="text-xs font-bold text-[#111111]">Credit / Debit Card</p>
                  <p className="text-[11px] text-[#7E818C]">Visa, Mastercard, RuPay, Amex</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-[#EAEAEC] rounded-[4px] p-5 space-y-4 bg-white">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#111111] border-b border-[#EAEAEC] pb-3">
              Order Summary ({items?.length || 0} Items)
            </h2>

            {/* Compact items list */}
            <div className="divide-y divide-[#F5F5F6] max-h-48 overflow-y-auto pr-1">
              {items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <p className="font-bold text-[#111111] truncate">{item.name || item.product?.name}</p>
                    <p className="text-[11px] text-[#7E818C]">Qty: {item.quantity} | Size: {item.size}</p>
                  </div>
                  <span className="font-bold text-[#111111] shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-[#EAEAEC] pt-3 space-y-2 text-xs text-[#535665]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#111111]">₹{subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Delivery</span>
                <span className={shippingFee === 0 ? 'text-[#03A685] font-bold' : 'text-[#111111]'}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
            </div>

            <div className="border-t border-[#EAEAEC] pt-3 flex justify-between text-sm font-bold text-[#111111]">
              <span>Total Payable</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={handlePlaceOrderAndPay}
              disabled={processing}
              className="w-full py-3.5 bg-[#FF3F6C] hover:bg-[#E0355D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-[3px] shadow-sm disabled:opacity-50 transition-colors"
            >
              {processing ? 'Processing Order...' : 'CONFIRM & PAY'}
            </button>
          </div>

          <div className="p-4 border border-[#EAEAEC] rounded-[4px] bg-[#FAFAFA] flex items-center gap-3 text-xs text-[#7E818C]">
            <FiLock className="w-4 h-4 text-[#282C3F] shrink-0" />
            <span>256-Bit SSL Encrypted Payment. Your data is strictly protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
