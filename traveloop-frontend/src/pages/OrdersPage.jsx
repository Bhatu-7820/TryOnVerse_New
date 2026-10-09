import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { FiShoppingBag, FiTruck, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-[#E6F7F3] text-[#03A685] font-bold text-[10px] px-2 py-0.5 rounded-[2px]">CONFIRMED</span>;
      case 'PROCESSING':
        return <span className="bg-[#F0F4FF] text-[#2F54EB] font-bold text-[10px] px-2 py-0.5 rounded-[2px]">PROCESSING</span>;
      case 'SHIPPED':
        return <span className="bg-[#E6F7FF] text-[#096DD9] font-bold text-[10px] px-2 py-0.5 rounded-[2px]">SHIPPED</span>;
      case 'DELIVERED':
        return <span className="bg-[#E6F7F3] text-[#03A685] font-bold text-[10px] px-2 py-0.5 rounded-[2px]">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="bg-[#FFF1F0] text-[#D32F2F] font-bold text-[10px] px-2 py-0.5 rounded-[2px]">CANCELLED</span>;
      default:
        return <span className="bg-[#F5F5F6] text-[#535665] font-bold text-[10px] px-2 py-0.5 rounded-[2px]">{status}</span>;
    }
  };

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6 bg-white">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <Link to="/dashboard" className="hover:text-[#111111]">Account</Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold">Orders</span>
      </nav>

      <div className="border-b border-[#EAEAEC] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#111111]">
          My Orders <span className="font-normal text-sm text-[#7E818C]">({orders.length} {orders.length === 1 ? 'order' : 'orders'})</span>
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#F5F5F6] animate-pulse rounded-[4px] border border-[#EAEAEC]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center border border-[#EAEAEC] rounded-[4px] bg-[#FAFAFA] space-y-4">
          <div className="w-16 h-16 rounded-full bg-white border border-[#EAEAEC] mx-auto flex items-center justify-center text-[#7E818C]">
            <FiShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="font-bold text-base text-[#111111]">No Orders Yet</h2>
          <p className="text-xs text-[#7E818C] max-w-sm mx-auto">
            You haven't placed any orders yet. Discover our latest collections and start shopping!
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider rounded-[3px] hover:bg-[#E0355D] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-[#EAEAEC] rounded-[4px] bg-white overflow-hidden hover:border-[#D4D5D9] transition-colors"
            >
              {/* Order Card Header */}
              <div className="p-4 bg-[#FAFAFA] border-b border-[#EAEAEC] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-[#7E818C] block text-[11px]">Order Number</span>
                    <strong className="text-[#111111]">{order.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[#7E818C] block text-[11px]">Order Placed</span>
                    <span className="text-[#282C3F]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-[#7E818C] block text-[11px]">Total Amount</span>
                    <strong className="text-[#111111]">₹{order.total?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-3.5 py-1.5 border border-[#D4D5D9] hover:border-[#111111] text-[#111111] font-bold text-xs rounded-[3px] flex items-center gap-1 transition-colors bg-white"
                  >
                    View Details <FiChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items in this Order */}
              <div className="divide-y divide-[#F5F5F6] p-4 space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="pt-2 flex items-center gap-4">
                    <div className="w-16 h-20 bg-[#F5F5F6] rounded-[2px] overflow-hidden shrink-0 border border-[#EAEAEC]">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 text-xs space-y-1">
                      <h4 className="font-bold text-[#111111] line-clamp-1">{item.name}</h4>
                      <p className="text-[#7E818C]">
                        Size: <span className="font-semibold text-[#282C3F]">{item.size}</span> | Qty: <span className="font-semibold text-[#282C3F]">{item.quantity}</span>
                      </p>
                      <p className="font-bold text-[#111111]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
