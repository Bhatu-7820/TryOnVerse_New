import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { auctionService } from '@/services/auctionService';
import {
  FiLayers,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiClock,
  FiAward,
  FiBox,
  FiDollarSign,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FashionAdminPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [tab, setTab] = useState('overview'); // overview, products, orders, auctions, designs, users
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: 'Roadster',
    category: '',
    price: '',
    salePrice: '',
    description: '',
    stock: 25,
    sizes: 'S, M, L, XL',
    colors: 'Black:#111111, White:#FFFFFF, Navy:#1E293B',
    images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    tryOnType: 'jacket',
    featured: true,
  });

  // New Auction Modal Form
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [newAuction, setNewAuction] = useState({
    productId: '',
    title: '',
    startingPrice: '',
    minBidIncrement: 500,
    endTime: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access restricted to administrators');
      navigate('/');
      return;
    }

    Promise.all([
      adminService.getStats(),
      productService.getProducts({ limit: 50 }),
      adminService.getAllOrders({ limit: 50 }),
      categoryService.getCategories(),
      adminService.getAllDesigns(),
      adminService.getAllUsers()
    ])
      .then(([statsRes, prodRes, ordRes, catRes, desRes, usrRes]) => {
        setStats(statsRes.data);
        setProducts(prodRes.data || []);
        setOrders(ordRes.data || []);
        setCategories(catRes.data || []);
        setDesigns(desRes.data || []);
        setUsersList(usrRes.data || []);
      })
      .catch((err) => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  // Product CRUD
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const formattedSizes = newProd.sizes.split(',').map((s) => s.trim());
      const formattedColors = newProd.colors.split(',').map((c) => {
        const [cName, cHex] = c.split(':').map((s) => s.trim());
        return { name: cName, hex: cHex || '#000000' };
      });

      const payload = {
        name: newProd.name,
        brand: newProd.brand,
        category: newProd.category || categories[0]?._id,
        price: Number(newProd.price),
        salePrice: newProd.salePrice ? Number(newProd.salePrice) : undefined,
        description: newProd.description,
        stock: Number(newProd.stock),
        sizes: formattedSizes,
        colors: formattedColors,
        images: [newProd.images],
        tryOnType: newProd.tryOnType,
        featured: newProd.featured,
      };

      const res = await productService.createProduct(payload);
      setProducts([res.data, ...products]);
      setShowProductModal(false);
      toast.success('Product created successfully');
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // Order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o._id === orderId ? res.data : o)));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Auction
  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: newAuction.productId,
        title: newAuction.title,
        startingPrice: Number(newAuction.startingPrice),
        minBidIncrement: Number(newAuction.minBidIncrement),
        endTime: newAuction.endTime,
      };
      await auctionService.createAuction(payload);
      setShowAuctionModal(false);
      toast.success('Fashion auction drop created!');
    } catch (err) {
      toast.error('Failed to create auction');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen py-20 text-center">
        <div className="h-8 w-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-[#7E818C]">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#111111]">
      {/* Top Header Bar */}
      <div className="border-b border-[#EAEAEC] bg-white">
        <div className="fashion-container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#7E818C] mb-1">
                <Link to="/" className="hover:text-[#111111]">Home</Link>
                <FiChevronRight className="text-[10px]" />
                <span className="font-semibold text-[#111111]">Store Administration</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                Merchant Operations Console
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowProductModal(true)}
                className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5"
              >
                <FiPlus className="text-sm" /> Add Product
              </button>
              <button
                onClick={() => setShowAuctionModal(true)}
                className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
              >
                <FiAward className="text-sm" /> Launch Auction
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fashion-container py-6 space-y-6">
        {/* KPI Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#EAEAEC] rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Total Revenue
                </span>
                <FiDollarSign className="text-base text-[#111111]" />
              </div>
              <p className="text-xl font-bold text-[#111111] mt-2">
                ₹{stats.revenue?.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-[#EAEAEC] rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Total Orders
                </span>
                <FiShoppingBag className="text-base text-[#111111]" />
              </div>
              <p className="text-xl font-bold text-[#111111] mt-2">
                {stats.totalOrders}
              </p>
            </div>

            <div className="bg-white border border-[#EAEAEC] rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Catalog Items
                </span>
                <FiBox className="text-base text-[#111111]" />
              </div>
              <p className="text-xl font-bold text-[#111111] mt-2">
                {stats.totalProducts}
              </p>
            </div>

            <div className="bg-white border border-[#EAEAEC] rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E818C]">
                  Customers
                </span>
                <FiUsers className="text-base text-[#111111]" />
              </div>
              <p className="text-xl font-bold text-[#111111] mt-2">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAEAEC] bg-white rounded-t-md px-4 pt-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'designs', label: `Custom Requests (${designs.length})` },
            { id: 'users', label: `Users (${usersList.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                tab === t.id
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#7E818C] hover:text-[#111111]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-[#EAEAEC] rounded-b-md p-5 shadow-sm">
          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-1">Store Performance Summary</h3>
                <p className="text-xs text-[#7E818C]">
                  Recent activity and operational metrics across TryOnVerse.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Orders Snippet */}
                <div className="border border-[#EAEAEC] rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Recent Orders
                    </h4>
                    <button
                      onClick={() => setTab('orders')}
                      className="text-xs font-semibold text-[#111111] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAEAEC]">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#111111]">#{o.orderNumber}</p>
                          <p className="text-[11px] text-[#7E818C]">{o.userId?.name || 'Customer'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#111111]">₹{o.total?.toLocaleString()}</p>
                          <span className="text-[10px] font-semibold text-emerald-600">
                            {o.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catalog Highlights Snippet */}
                <div className="border border-[#EAEAEC] rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Top Catalog Items
                    </h4>
                    <button
                      onClick={() => setTab('products')}
                      className="text-xs font-semibold text-[#111111] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAEAEC]">
                    {products.slice(0, 5).map((p) => (
                      <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="h-8 w-8 rounded object-cover border border-[#EAEAEC]"
                          />
                          <div>
                            <p className="font-semibold text-[#111111] truncate max-w-[160px]">{p.name}</p>
                            <p className="text-[10px] text-[#7E818C]">{p.brand}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#111111]">₹{p.price.toLocaleString()}</p>
                          <span className="text-[10px] text-[#7E818C]">{p.stock} in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Product Catalog
                </h3>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="btn-primary text-xs !py-1.5 !px-3"
                >
                  + Add New
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EAEAEC] text-[#7E818C] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3">3D Fit</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEC]">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-[#F9FAFB]">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="h-10 w-9 rounded object-cover border border-[#EAEAEC]"
                          />
                          <div>
                            <p className="font-semibold text-[#111111]">{p.name}</p>
                            <p className="text-[11px] text-[#7E818C] uppercase">{p.brand}</p>
                          </div>
                        </td>
                        <td className="py-3 text-[#7E818C]">{p.category?.name || 'Fashion'}</td>
                        <td className="py-3 font-semibold text-[#111111]">₹{p.price.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`text-[11px] font-semibold ${p.stock > 5 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 capitalize text-[#7E818C]">{p.tryOnType || 'standard'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="text-[#7E818C] hover:text-red-600 p-1"
                            title="Delete"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Customer Orders
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EAEAEC] text-[#7E818C] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEC]">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-[#F9FAFB]">
                        <td className="py-3 font-mono font-semibold text-[#111111]">#{o.orderNumber}</td>
                        <td className="py-3 text-[#111111]">{o.userId?.name || o.shippingAddress?.fullName}</td>
                        <td className="py-3 font-semibold text-[#111111]">₹{o.total?.toLocaleString()}</td>
                        <td className="py-3">
                          <span className="text-[11px] font-semibold text-emerald-600">{o.paymentStatus}</span>
                        </td>
                        <td className="py-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="text-xs px-2 py-1 border border-[#EAEAEC] rounded bg-white text-[#111111] outline-none"
                          >
                            {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          <Link to={`/orders/${o._id}`} className="text-xs font-semibold text-[#111111] hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Custom Designs Tab */}
          {tab === 'designs' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Custom Tailoring Inquiries
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {designs.map((d) => (
                  <div key={d._id} className="border border-[#EAEAEC] rounded p-4 text-xs space-y-2 bg-white">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[#111111]">{d.title}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111111] uppercase">
                        {d.status}
                      </span>
                    </div>
                    <p className="text-[#7E818C]">Customer: <span className="font-semibold text-[#111111]">{d.userId?.name || 'Customer'}</span></p>
                    <p className="text-[#7E818C]">Silhouette: <span className="font-semibold text-[#111111] capitalize">{d.template}</span></p>
                    <div className="flex items-center gap-2">
                      <span className="text-[#7E818C]">Dye:</span>
                      <span className="h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: d.baseColor }} />
                      <span className="font-mono text-[#7E818C]">{d.baseColor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Registered Customers & Admins
              </h3>

              <div className="divide-y divide-[#EAEAEC]">
                {usersList.map((u) => (
                  <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#111111]">{u.name}</p>
                      <p className="text-[#7E818C]">{u.email}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'admin'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-[#111111]'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateProduct}
            className="w-full max-w-lg bg-white rounded-md border border-[#EAEAEC] p-6 space-y-4 text-xs shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">Add New Fashion Item</h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-[#7E818C] hover:text-[#111111]"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Product Title</label>
              <input
                type="text"
                required
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                placeholder="e.g. Slim Fit Cotton Oxford Shirt"
                className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={newProd.brand}
                  onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                  placeholder="e.g. Roadster"
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Category</label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Regular Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                  placeholder="1799"
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  value={newProd.salePrice}
                  onChange={(e) => setNewProd({ ...newProd, salePrice: e.target.value })}
                  placeholder="899"
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Stock</label>
                <input
                  type="number"
                  required
                  value={newProd.stock}
                  onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">3D Mannequin Fit</label>
                <select
                  value={newProd.tryOnType}
                  onChange={(e) => setNewProd({ ...newProd, tryOnType: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                >
                  <option value="jacket">Jacket</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="tshirt">T-Shirt</option>
                  <option value="dress">Dress</option>
                  <option value="pants">Pants</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={newProd.description}
                onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                placeholder="Product fabrication details and fit..."
                className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Image URL</label>
              <input
                type="text"
                required
                value={newProd.images}
                onChange={(e) => setNewProd({ ...newProd, images: e.target.value })}
                className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="submit" className="flex-1 btn-primary text-xs !py-2.5 font-bold">
                Publish Product
              </button>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="btn-secondary text-xs !py-2.5 px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Launch Auction */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateAuction}
            className="w-full max-w-md bg-white rounded-md border border-[#EAEAEC] p-6 space-y-4 text-xs shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">Launch Fashion Auction</h3>
              <button
                type="button"
                onClick={() => setShowAuctionModal(false)}
                className="text-[#7E818C] hover:text-[#111111]"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Select Product</label>
              <select
                required
                value={newAuction.productId}
                onChange={(e) => {
                  const p = products.find((pr) => pr._id === e.target.value);
                  setNewAuction({
                    ...newAuction,
                    productId: e.target.value,
                    title: p ? `Runway Drop: ${p.name}` : '',
                    startingPrice: p ? p.price : '',
                  });
                }}
                className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Auction Title</label>
              <input
                type="text"
                required
                value={newAuction.title}
                onChange={(e) => setNewAuction({ ...newAuction, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Starting Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newAuction.startingPrice}
                  onChange={(e) => setNewAuction({ ...newAuction, startingPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Min Increment (₹)</label>
                <input
                  type="number"
                  required
                  value={newAuction.minBidIncrement}
                  onChange={(e) => setNewAuction({ ...newAuction, minBidIncrement: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#111111] block mb-1">Closing Date & Time</label>
              <input
                type="datetime-local"
                required
                value={newAuction.endTime}
                onChange={(e) => setNewAuction({ ...newAuction, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-[#EAEAEC] rounded text-xs outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="submit" className="flex-1 btn-primary text-xs !py-2.5 font-bold">
                Start Auction Stream
              </button>
              <button
                type="button"
                onClick={() => setShowAuctionModal(false)}
                className="btn-secondary text-xs !py-2.5 px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
