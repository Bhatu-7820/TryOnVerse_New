import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import {
  FiArrowLeft,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPackage,
  FiShield,
  FiMapPin,
  FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderService
      .getOrder(id)
      .then((res) => setOrder(res.data))
      .catch((err) => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(order._id);
      setOrder(res.data);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen py-20 text-center">
        <div className="h-8 w-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-[#7E818C]">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-[#111111]">Order Not Found</h2>
        <Link to="/orders" className="btn-primary text-xs inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#111111]">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#EAEAEC] bg-white">
        <div className="fashion-container py-3">
          <div className="flex items-center gap-1.5 text-xs text-[#7E818C]">
            <Link to="/" className="hover:text-[#111111]">Home</Link>
            <FiChevronRight className="text-[10px]" />
            <Link to="/orders" className="hover:text-[#111111]">My Orders</Link>
            <FiChevronRight className="text-[10px]" />
            <span className="font-semibold text-[#111111]">#{order.orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="fashion-container py-8 max-w-5xl space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EAEAEC]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                Order #{order.orderNumber}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                order.orderStatus === 'DELIVERED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : order.orderStatus === 'CANCELLED'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-[#7E818C] mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/orders" className="btn-secondary text-xs !py-2 flex items-center gap-1.5">
              <FiArrowLeft /> All Orders
            </Link>
            {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="text-xs font-semibold px-3 py-2 border border-red-200 text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Dispatch Progress Tracker */}
        {order.orderStatus !== 'CANCELLED' ? (
          <div className="border border-[#EAEAEC] rounded-md p-6 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-6">
              Delivery Progress
            </h3>

            <div className="relative flex items-center justify-between">
              {/* Progress Bar background line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#EAEAEC] -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#111111] -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${
                    currentStepIndex >= 0
                      ? (currentStepIndex / (steps.length - 1)) * 100
                      : 0
                  }%`,
                }}
              />

              {steps.map((st, idx) => {
                const isPast = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={st} className="relative z-10 flex flex-col items-center bg-white px-2">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                        isPast
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#EAEAEC] bg-white text-[#7E818C]'
                      }`}
                    >
                      {isPast ? <FiCheckCircle className="text-xs" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-medium ${
                        isCurrent
                          ? 'font-bold text-[#111111]'
                          : isPast
                          ? 'text-[#111111]'
                          : 'text-[#7E818C]'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border border-red-200 bg-red-50 rounded-md p-5 text-center space-y-1">
            <FiXCircle className="mx-auto text-2xl text-red-600" />
            <h3 className="text-sm font-bold text-red-800">Order Cancelled</h3>
            <p className="text-xs text-red-600">This order has been cancelled and any refund has been initiated.</p>
          </div>
        )}

        {/* Items & Shipping Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Order Items (7 cols) */}
          <div className="md:col-span-7 border border-[#EAEAEC] rounded-md p-5 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Items in this Shipment ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-[#EAEAEC]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="h-16 w-14 rounded object-cover border border-[#EAEAEC]"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-[#111111] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#7E818C] mt-0.5">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                    <p className="font-bold text-[#111111] mt-1">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Details */}
            <div className="pt-4 border-t border-[#EAEAEC] space-y-2 text-xs">
              <div className="flex justify-between text-[#7E818C]">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-[#111111]">₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#7E818C]">
                <span>Delivery:</span>
                <span className="font-semibold text-emerald-600">
                  {order.shippingFee ? `₹${order.shippingFee}` : 'FREE'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#EAEAEC] flex justify-between text-sm font-bold text-[#111111]">
                <span>Total Amount:</span>
                <span>₹{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Address & Payment (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            {/* Delivery Address */}
            <div className="border border-[#EAEAEC] rounded-md p-5 bg-white space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <FiMapPin className="text-sm text-[#7E818C]" /> Delivery Address
              </h3>
              <div className="text-xs text-[#111111] space-y-1">
                <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                <p className="text-[#7E818C]">{order.shippingAddress?.street}</p>
                <p className="text-[#7E818C]">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                </p>
                <p className="text-[#7E818C] pt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border border-[#EAEAEC] rounded-md p-5 bg-white space-y-2.5 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <FiShield className="text-sm text-[#7E818C]" /> Payment Information
              </h3>
              <div className="space-y-2 text-[#7E818C]">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold text-[#111111]">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between">
                    <span>Reference ID:</span>
                    <span className="font-mono text-[#111111]">{order.paymentReference}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
