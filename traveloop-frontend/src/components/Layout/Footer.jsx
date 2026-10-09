import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiShield, FiRefreshCw, FiTruck } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#EAEAEC] bg-[#FAFAFA] text-[#696B79] text-xs">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-[#EAEAEC] py-8">
        <div className="fashion-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center text-[#111111] shrink-0 shadow-subtle">
                <FiShield className="w-5 h-5 text-[#282C3F]" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm uppercase tracking-wide">100% Original Guarantee</h4>
                <p className="text-[#7E818C] text-xs mt-0.5">Authentic designer merchandise sourced directly from fashion brands.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center text-[#111111] shrink-0 shadow-subtle">
                <FiRefreshCw className="w-5 h-5 text-[#282C3F]" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm uppercase tracking-wide">14 Days Easy Returns</h4>
                <p className="text-[#7E818C] text-xs mt-0.5">Hassle-free return & exchange policy with instant doorstep pickup.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center text-[#111111] shrink-0 shadow-subtle">
                <FiTruck className="w-5 h-5 text-[#282C3F]" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm uppercase tracking-wide">Express Delivery</h4>
                <p className="text-[#7E818C] text-xs mt-0.5">Complimentary express shipping across all major fashion destinations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="fashion-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: Online Shopping */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Online Shopping</h4>
            <ul className="space-y-2 text-[#535665]">
              <li><Link to="/shop?gender=men" className="hover:text-[#111111] transition-colors">Men's Wear</Link></li>
              <li><Link to="/shop?gender=women" className="hover:text-[#111111] transition-colors">Women's Wear</Link></li>
              <li><Link to="/shop?gender=kids" className="hover:text-[#111111] transition-colors">Kids Collection</Link></li>
              <li><Link to="/shop?sort=newest" className="hover:text-[#111111] transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?sale=true" className="hover:text-[#FF5722] font-semibold transition-colors">Special Offers & Sale</Link></li>
            </ul>
          </div>

          {/* Col 2: TryOnVerse Innovation */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Interactive Studio</h4>
            <ul className="space-y-2 text-[#535665]">
              <li><Link to="/try-on" className="hover:text-[#111111] transition-colors">Virtual 3D Try-On</Link></li>
              <li><Link to="/body-scan" className="hover:text-[#111111] transition-colors">Size Assistant & Fit</Link></li>
              <li><Link to="/designer" className="hover:text-[#111111] transition-colors">Custom Cloth Designer</Link></li>
              <li><Link to="/auctions" className="hover:text-[#111111] transition-colors">Fashion Drops & Auctions</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Customer Policies</h4>
            <ul className="space-y-2 text-[#535665]">
              <li><Link to="/orders" className="hover:text-[#111111] transition-colors">Track Orders</Link></li>
              <li><span className="hover:text-[#111111] cursor-pointer">Shipping & Delivery</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer">Cancellation & Returns</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-[#111111] cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

          {/* Col 4: Account & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">My Account</h4>
            <ul className="space-y-2 text-[#535665]">
              <li><Link to="/dashboard" className="hover:text-[#111111] transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-[#111111] transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#111111] transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-[#111111] transition-colors">Shopping Bag</Link></li>
            </ul>
          </div>

          {/* Col 5: Social & Newsletter */}
          <div className="space-y-3 col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Keep In Touch</h4>
            <div className="flex items-center gap-3 text-[#282C3F] pt-1">
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center hover:border-[#111111] transition-colors" aria-label="Instagram">
                <FiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center hover:border-[#111111] transition-colors" aria-label="Twitter">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center hover:border-[#111111] transition-colors" aria-label="Facebook">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#EAEAEC] flex items-center justify-center hover:border-[#111111] transition-colors" aria-label="YouTube">
                <FiYoutube className="w-4 h-4" />
              </a>
            </div>
            <div className="pt-2 text-[#7E818C]">
              <p className="font-bold text-[#111111]">TRYONVERSE ATELIER</p>
              <p className="mt-0.5">Premier Fashion E-Commerce & Interactive Virtual Dressing.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#EAEAEC] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#7E818C] text-[11px]">
          <p>© 2026 TryOnVerse. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#111111] cursor-pointer">Security Standards</span>
            <span className="hover:text-[#111111] cursor-pointer">Authenticity Certified</span>
            <span className="hover:text-[#111111] cursor-pointer">Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
