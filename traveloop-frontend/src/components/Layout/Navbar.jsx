import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiPackage,
  FiSliders,
  FiLogOut
} from 'react-icons/fi';
import { logout } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';
import { fetchWishlist } from '@/store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out');
      setProfileOpen(false);
      navigate('/');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const navCategories = [
    { label: 'MEN', to: '/shop?gender=Men' },
    { label: 'WOMEN', to: '/shop?gender=Women' },
    { label: 'KIDS', to: '/shop?gender=Kids' },
    { label: 'NEW', to: '/shop?sort=newest' },
    { label: 'SALE', to: '/shop?sort=better-discount', isSale: true },
    { label: 'TRY-ON', to: '/try-on' },
    { label: 'DESIGNER', to: '/designer' },
    { label: 'AUCTIONS', to: '/auctions' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-[#EAEAEC] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="fashion-container">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-6">

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#282C3F] hover:text-[#111111]"
              aria-label="Open menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Fashion Brand Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="flex items-center justify-center w-6 h-6 border border-[#111111] text-[10px] font-black tracking-tighter text-[#111111] rounded-[2px]">
                TV
              </span>
              <span className="font-extrabold text-lg sm:text-xl tracking-[0.16em] text-[#111111]">
                TRYONVERSE
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-6 h-full">
              {navCategories.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative h-full flex items-center text-[12px] xl:text-[13px] font-bold tracking-[0.08em] transition-colors py-1 ${isActive
                      ? 'text-[#111111] border-b-2 border-[#111111]'
                      : item.isSale
                        ? 'text-[#FF5722] hover:text-[#E64A19]'
                        : 'text-[#282C3F] hover:text-[#111111]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Search Input (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[#F5F5F6] text-[#282C3F] placeholder-[#94969F] rounded-[2px] border border-transparent focus:border-[#D4D5D9] focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E818C] hover:text-[#111111]"
                  aria-label="Submit search"
                >
                  <FiSearch className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Right Action Icons (Profile, Wishlist, Bag) */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden text-[#282C3F] p-1"
                aria-label="Toggle search"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex flex-col items-center text-[#282C3F] hover:text-[#111111] transition-colors p-1"
                  aria-label="User account"
                >
                  <FiUser className="w-[18px] h-[18px] text-[#282C3F]" />
                  <span className="hidden sm:block text-[10px] font-bold mt-0.5 tracking-tight uppercase">
                    {user ? user.name.split(' ')[0] : 'Profile'}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-[#EAEAEC] shadow-md rounded-[2px] py-2 text-xs text-[#282C3F] z-50">
                    {user ? (
                      <div>
                        <div className="px-4 py-2 border-b border-[#F5F5F6]">
                          <p className="font-bold text-xs text-[#111111]">{user.name}</p>
                          <p className="text-[11px] text-[#7E818C] truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-[#F5F5F6] text-[#535665] rounded-[2px]">
                            {user.role === 'admin' ? 'ADMINISTRATOR' : 'CUSTOMER'}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#F5F5F6] text-[#282C3F]"
                          >
                            <FiUser className="w-3.5 h-3.5 text-[#7E818C]" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#F5F5F6] text-[#282C3F]"
                          >
                            <FiPackage className="w-3.5 h-3.5 text-[#7E818C]" />
                            <span>Orders & Tracking</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#F5F5F6] text-[#282C3F]"
                          >
                            <FiHeart className="w-3.5 h-3.5 text-[#7E818C]" />
                            <span>Wishlist ({wishlistItems.length})</span>
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-[#F5F5F6] text-[#111111] font-bold"
                            >
                              <FiSliders className="w-3.5 h-3.5 text-[#111111]" />
                              <span>Admin Operations</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-[#F5F5F6] pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 hover:bg-[#FEF2F2] text-red-600 font-semibold"
                          >
                            <FiLogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <p className="font-bold text-xs text-[#111111]">Welcome to TryOnVerse</p>
                        <p className="text-[11px] text-[#7E818C] mt-0.5 mb-3">To access your bag, orders & wishlist</p>
                        <Link
                          to="/login"
                          onClick={() => setProfileOpen(false)}
                          className="block w-full py-2 text-center text-xs font-bold uppercase tracking-wider bg-[#111111] text-white rounded-[2px]"
                        >
                          Sign In / Register
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative flex flex-col items-center text-[#282C3F] hover:text-[#111111] transition-colors p-1"
                aria-label="Wishlist"
              >
                <FiHeart className="w-[18px] h-[18px]" />
                <span className="hidden sm:block text-[10px] font-bold mt-0.5 tracking-tight uppercase">
                  Wishlist
                </span>
                {wishlistItems.length > 0 && (
                  <span className="absolute top-0 right-0 sm:right-1 w-3.5 h-3.5 rounded-full bg-[#FF3F6C] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Bag Icon */}
              <Link
                to="/cart"
                className="relative flex flex-col items-center text-[#282C3F] hover:text-[#111111] transition-colors p-1"
                aria-label="Shopping Bag"
              >
                <FiShoppingBag className="w-[18px] h-[18px]" />
                <span className="hidden sm:block text-[10px] font-bold mt-0.5 tracking-tight uppercase">
                  Bag
                </span>
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 sm:right-0.5 w-3.5 h-3.5 rounded-full bg-[#111111] text-white text-[9px] font-bold flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Expandable Bar */}
          {mobileSearchOpen && (
            <div className="pb-3 md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[#F5F5F6] text-[#282C3F] placeholder-[#94969F] rounded-[2px] border border-transparent focus:border-[#D4D5D9] focus:bg-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E818C]"
                  aria-label="Submit search"
                >
                  <FiSearch className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slide Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-xl flex flex-col z-10">
            <div className="flex items-center justify-between p-4 border-b border-[#EAEAEC]">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 border border-[#111111] text-[9px] font-black text-[#111111] rounded-[2px]">
                  TV
                </span>
                <span className="font-extrabold text-base tracking-[0.16em] text-[#111111]">
                  TRYONVERSE
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#7E818C] hover:text-[#111111]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-xs font-bold tracking-wider">
              {navCategories.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded hover:bg-[#F5F5F6] text-[#282C3F]"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-[#EAEAEC] bg-[#FAFAFA] text-xs">
              {user ? (
                <div className="space-y-2">
                  <p className="font-bold text-[#111111]">{user.name}</p>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[#7E818C] hover:text-[#111111]"
                  >
                    My Account & Orders
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block text-red-600 font-semibold pt-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center font-bold uppercase tracking-wider bg-[#111111] text-white rounded-[2px]"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
