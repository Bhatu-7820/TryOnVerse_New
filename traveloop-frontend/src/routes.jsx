import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import AIAssistant from '@/components/AIAssistant';

// TryOnVerse Fashion Pages
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import TryOnPage from '@/pages/TryOnPage';
import BodyScannerPage from '@/pages/BodyScannerPage';
import CustomDesignerPage from '@/pages/CustomDesignerPage';
import AuctionsPage from '@/pages/AuctionsPage';
import AuctionDetailPage from '@/pages/AuctionDetailPage';
import CartPage from '@/pages/CartPage';
import WishlistPage from '@/pages/WishlistPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import UserDashboardPage from '@/pages/UserDashboardPage';
import FashionAdminPage from '@/pages/FashionAdminPage';

// Auth Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import ScrollToTop from '@/components/ScrollToTop';
import { useSocket } from '@/hooks/useSocket';

function MainLayout() {
  // Initialize Socket.io connection for auctions and live updates
  useSocket();

  return (
    <>
      <ScrollToTop />
      <div className="relative min-h-screen bg-white text-[#111111] flex flex-col font-sans selection:bg-[#111111] selection:text-white">
        <Navbar />

        <main className="flex-1 w-full">
          <Outlet />
        </main>

        <Footer />
        <AIAssistant />
      </div>
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Main Fashion Application Layout */}
      <Route element={<MainLayout />}>
        {/* Public Browsing Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:id" element={<ProductDetailPage />} />
        <Route path="/category/:slug" element={<ShopPage />} />
        <Route path="/try-on" element={<TryOnPage />} />
        <Route path="/body-scan" element={<BodyScannerPage />} />
        <Route path="/designer" element={<CustomDesignerPage />} />
        <Route path="/auctions" element={<AuctionsPage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />

        {/* Authenticated User Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Console Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <FashionAdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
