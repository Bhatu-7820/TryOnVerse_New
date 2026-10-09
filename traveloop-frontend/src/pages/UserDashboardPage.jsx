import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { userService } from '@/services/userService';
import { orderService } from '@/services/orderService';
import { bodyScanService } from '@/services/bodyScanService';
import { designService } from '@/services/designService';
import { updateProfile } from '@/store/slices/authSlice';
import {
  FiUser,
  FiShoppingBag,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiBox,
  FiEdit3,
  FiCheck,
  FiSliders,
  FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UserDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, addresses, size, designs, profile
  const [orders, setOrders] = useState([]);
  const [scans, setScans] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredSize, setPreferredSize] = useState(user?.preferences?.preferredSize || 'M');

  // Address Form Modal
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      Promise.all([
        orderService.getMyOrders(),
        bodyScanService.getMyScans(),
        designService.getMyDesigns(),
        userService.getAddresses()
      ])
        .then(([ordersRes, scansRes, designsRes, addrRes]) => {
          setOrders(ordersRes.data || []);
          setScans(scansRes.data || []);
          setDesigns(designsRes.data || []);
          setAddresses(addrRes.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({ name, phone, preferences: { preferredSize } })).unwrap();
      toast.success('Profile preferences updated');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.addAddress(newAddr);
      setAddresses(res.data || []);
      setShowAddAddress(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
      });
      toast.success('Address added successfully');
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await userService.deleteAddress(addrId);
      setAddresses(res.data || []);
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  if (!user) {
    return (
      <div className="fashion-container py-24 text-center space-y-4">
        <h2 className="text-xl font-bold uppercase text-[#111111]">Please Log In</h2>
        <p className="text-xs text-[#7E818C]">Login to access your fashion profile, orders and saved addresses.</p>
        <Link to="/login" className="inline-block px-8 py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-[3px]">
          Login
        </Link>
      </div>
    );
  }

  const latestScan = scans[0];

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'orders', label: 'Orders & Tracking', icon: FiShoppingBag, count: orders.length },
    { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin, count: addresses.length },
    { id: 'size', label: 'Size Profile & Fit', icon: FiSliders },
    { id: 'designs', label: 'Saved Custom Designs', icon: FiEdit3, count: designs.length },
    { id: 'profile', label: 'Profile Details', icon: FiUser },
  ];

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6 bg-white">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold">My Account</span>
      </nav>

      {/* Main Account Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 border border-[#EAEAEC] rounded-[4px] bg-white overflow-hidden">
          <div className="p-5 border-b border-[#EAEAEC] bg-[#FAFAFA]">
            <p className="font-extrabold text-sm uppercase tracking-wide text-[#111111]">{user.name}</p>
            <p className="text-xs text-[#7E818C] truncate mt-0.5">{user.email}</p>
          </div>

          <nav className="divide-y divide-[#F5F5F6] text-xs font-semibold text-[#282C3F]">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors text-left ${
                    isActive
                      ? 'bg-[#FFF0F4] text-[#FF3F6C] font-bold border-l-4 border-[#FF3F6C]'
                      : 'hover:bg-[#F5F5F6]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#7E818C]" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[11px] font-bold text-[#7E818C]">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Panel */}
        <div className="lg:col-span-9 border border-[#EAEAEC] rounded-[4px] p-6 bg-white min-h-[480px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="border-b border-[#EAEAEC] pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">Account Overview</h2>
                <p className="text-xs text-[#7E818C] mt-0.5">Welcome back to your TryOnVerse profile</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 border border-[#EAEAEC] rounded-[4px] bg-[#FAFAFA]">
                  <p className="text-xs text-[#7E818C]">Orders Placed</p>
                  <strong className="text-xl text-[#111111] mt-1 block">{orders.length}</strong>
                </div>
                <div className="p-4 border border-[#EAEAEC] rounded-[4px] bg-[#FAFAFA]">
                  <p className="text-xs text-[#7E818C]">Saved Addresses</p>
                  <strong className="text-xl text-[#111111] mt-1 block">{addresses.length}</strong>
                </div>
                <div className="p-4 border border-[#EAEAEC] rounded-[4px] bg-[#FAFAFA]">
                  <p className="text-xs text-[#7E818C]">Size Preference</p>
                  <strong className="text-xl text-[#FF3F6C] mt-1 block">{preferredSize}</strong>
                </div>
                <div className="p-4 border border-[#EAEAEC] rounded-[4px] bg-[#FAFAFA]">
                  <p className="text-xs text-[#7E818C]">Custom Designs</p>
                  <strong className="text-xl text-[#111111] mt-1 block">{designs.length}</strong>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="space-y-3 pt-4 border-t border-[#EAEAEC]">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Recent Orders</h3>
                  <Link to="/orders" className="text-xs font-bold text-[#FF3F6C] hover:underline">
                    View All Orders →
                  </Link>
                </div>
                {orders.length === 0 ? (
                  <p className="text-xs text-[#7E818C] py-4">No recent orders found.</p>
                ) : (
                  <div className="divide-y divide-[#F5F5F6] border border-[#EAEAEC] rounded-[4px]">
                    {orders.slice(0, 2).map((ord) => (
                      <div key={ord._id} className="p-4 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-[#111111]">Order #{ord.orderNumber}</p>
                          <p className="text-[#7E818C] text-[11px]">
                            {ord.items?.length || 0} items | ₹{ord.total?.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Link to={`/orders/${ord._id}`} className="font-bold text-[#FF3F6C] hover:underline">
                          Track Details
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">Orders & Tracking</h2>
                <Link to="/orders" className="text-xs font-bold text-[#FF3F6C] hover:underline">
                  Open Dedicated Orders Page →
                </Link>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-[#7E818C] py-8 text-center">No orders placed yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o._id} className="p-4 border border-[#EAEAEC] rounded-[4px] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#111111]">Order #{o.orderNumber}</p>
                        <p className="text-[#7E818C]">Status: <strong className="text-[#03A685]">{o.orderStatus}</strong></p>
                      </div>
                      <Link to={`/orders/${o._id}`} className="px-3 py-1.5 border border-[#D4D5D9] text-[#111111] font-bold rounded-[3px]">
                        Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">Saved Delivery Addresses</h2>
                  <p className="text-xs text-[#7E818C] mt-0.5">Manage your shipping and billing locations</p>
                </div>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase rounded-[3px] flex items-center gap-1.5"
                >
                  <FiPlus /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-xs text-[#7E818C] py-8 text-center">No delivery addresses saved yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="p-4 border border-[#EAEAEC] rounded-[4px] text-xs space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-[#111111]">{addr.fullName}</strong>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-[#03A685] bg-[#E6F7F3] px-2 py-0.5 rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-[#535665] leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-[#7E818C]">Mobile: {addr.phone}</p>
                      <div className="pt-2 border-t border-[#F5F5F6] flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-[#D32F2F] font-bold text-xs hover:underline flex items-center gap-1"
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Address Modal */}
              {showAddAddress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-[4px] max-w-md w-full p-6 space-y-4 shadow-xl border border-[#EAEAEC]">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111] border-b border-[#EAEAEC] pb-2">
                      Add New Address
                    </h3>
                    <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[#7E818C] mb-1 font-semibold">Full Name *</label>
                        <input
                          type="text"
                          value={newAddr.fullName}
                          onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                          className="w-full h-9 px-3 border border-[#D4D5D9] rounded-[3px]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[#7E818C] mb-1 font-semibold">Phone *</label>
                        <input
                          type="text"
                          value={newAddr.phone}
                          onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                          className="w-full h-9 px-3 border border-[#D4D5D9] rounded-[3px]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[#7E818C] mb-1 font-semibold">Street / Address *</label>
                        <input
                          type="text"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                          className="w-full h-9 px-3 border border-[#D4D5D9] rounded-[3px]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#7E818C] mb-1 font-semibold">City *</label>
                          <input
                            type="text"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                            className="w-full h-9 px-3 border border-[#D4D5D9] rounded-[3px]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[#7E818C] mb-1 font-semibold">PIN Code *</label>
                          <input
                            type="text"
                            value={newAddr.zipCode}
                            onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                            className="w-full h-9 px-3 border border-[#D4D5D9] rounded-[3px]"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-[#EAEAEC]">
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="flex-1 py-2 border border-[#D4D5D9] text-xs font-bold rounded-[3px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-[#111111] text-white text-xs font-bold rounded-[3px]"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SIZE PROFILE */}
          {activeTab === 'size' && (
            <div className="space-y-6">
              <div className="border-b border-[#EAEAEC] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">Size Profile & Fit</h2>
                  <p className="text-xs text-[#7E818C] mt-0.5">Estimated anatomical measurements for size recommendations</p>
                </div>
                <Link
                  to="/body-scan"
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase rounded-[3px]"
                >
                  Calibrate Size
                </Link>
              </div>

              {latestScan ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEC] rounded-[4px] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#7E818C]">Recommended Apparel Size</p>
                      <strong className="text-2xl text-[#FF3F6C]">{latestScan.recommendedSize}</strong>
                    </div>
                    <span className="text-xs font-bold text-[#03A685] bg-[#E6F7F3] px-2.5 py-1 rounded">
                      Calibrated Fit
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 border border-[#EAEAEC] rounded-[3px]">
                      <span className="text-[#7E818C] block">Height</span>
                      <strong className="text-[#111111] text-sm">{latestScan.measurements?.heightCm} cm</strong>
                    </div>
                    <div className="p-3 border border-[#EAEAEC] rounded-[3px]">
                      <span className="text-[#7E818C] block">Chest</span>
                      <strong className="text-[#111111] text-sm">{latestScan.measurements?.chestCm} cm</strong>
                    </div>
                    <div className="p-3 border border-[#EAEAEC] rounded-[3px]">
                      <span className="text-[#7E818C] block">Waist</span>
                      <strong className="text-[#111111] text-sm">{latestScan.measurements?.waistCm} cm</strong>
                    </div>
                    <div className="p-3 border border-[#EAEAEC] rounded-[3px]">
                      <span className="text-[#7E818C] block">Hips</span>
                      <strong className="text-[#111111] text-sm">{latestScan.measurements?.hipsCm} cm</strong>
                    </div>
                    <div className="p-3 border border-[#EAEAEC] rounded-[3px]">
                      <span className="text-[#7E818C] block">Shoulder Width</span>
                      <strong className="text-[#111111] text-sm">{latestScan.measurements?.shoulderWidthCm || 45} cm</strong>
                    </div>
                    <div className="p-3 border border-[#EAEAEC] rounded-[3px]">
                      <span className="text-[#7E818C] block">Inseam</span>
                      <strong className="text-[#111111] text-sm">{latestScan.measurements?.inseamCm || 78} cm</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F5F5F6] rounded-[3px] text-[11px] text-[#7E818C] italic">
                    Disclaimer: Anthropometric measurements are approximate visual estimations used exclusively for apparel size matching.
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs text-[#7E818C]">No size profile calibrated yet.</p>
                  <Link
                    to="/body-scan"
                    className="inline-block px-6 py-2.5 bg-[#FF3F6C] text-white text-xs font-bold uppercase rounded-[3px]"
                  >
                    Calibrate Now
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SAVED DESIGNS */}
          {activeTab === 'designs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">Saved Bespoke Designs</h2>
                  <p className="text-xs text-[#7E818C] mt-0.5">Apparel created in the Custom Cloth Designer studio</p>
                </div>
                <Link
                  to="/designer"
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase rounded-[3px]"
                >
                  Open Designer
                </Link>
              </div>

              {designs.length === 0 ? (
                <p className="text-xs text-[#7E818C] py-8 text-center">No custom apparel designs created yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designs.map((d) => (
                    <div key={d._id} className="p-4 border border-[#EAEAEC] rounded-[4px] flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-sm text-[#111111] block">{d.title}</strong>
                        <p className="text-[#7E818C]">Template: <span className="capitalize">{d.template}</span></p>
                        <p className="text-[#7E818C] text-[11px]">Status: <span className="text-[#03A685] font-bold">{d.status}</span></p>
                      </div>
                      <Link
                        to="/designer"
                        className="px-3 py-1.5 border border-[#D4D5D9] text-[#111111] font-bold rounded-[3px] hover:border-[#111111]"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROFILE FORM */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-[#EAEAEC] pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">Profile Details</h2>
                <p className="text-xs text-[#7E818C] mt-0.5">Update your personal and sizing details</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px]"
                  />
                </div>
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Email (Non-editable)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-10 px-3 border border-[#EAEAEC] bg-[#F5F5F6] text-[#7E818C] rounded-[3px]"
                  />
                </div>
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px]"
                  />
                </div>
                <div>
                  <label className="block text-[#7E818C] mb-1 font-semibold">Preferred Size</label>
                  <select
                    value={preferredSize}
                    onChange={(e) => setPreferredSize(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D4D5D9] rounded-[3px] bg-white cursor-pointer"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#111111] text-white font-bold text-xs uppercase rounded-[3px] hover:bg-black transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
