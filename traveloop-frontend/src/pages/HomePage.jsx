import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { auctionService } from '@/services/auctionService';
import ProductCard from '@/components/ProductCard';
import {
  FiArrowRight,
  FiBox,
  FiClock,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      id: 1,
      badge: 'SPRING / SUMMER 2026',
      title: 'FIND YOUR STYLE.',
      subtitle: 'Discover contemporary tailoring, relaxed denim, and elevated everyday luxury across 180+ curated pieces.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: { text: 'SHOP NEW IN', to: '/shop?sort=newest' },
      secondaryBtn: { text: 'SHOP WOMEN', to: '/shop?gender=Women' },
      accent: '#FF3F6C'
    },
    {
      id: 2,
      badge: 'STREETWEAR & ESSENTIALS',
      title: 'URBAN MINIMALISM.',
      subtitle: 'Heavyweight combed cotton tees, vintage wash denim, and structured utility jackets built to last.',
      image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: { text: 'SHOP MEN', to: '/shop?gender=Men' },
      secondaryBtn: { text: 'VIEW DENIM', to: '/shop?category=jeans' },
      accent: '#38BDF8'
    },
    {
      id: 3,
      badge: '3D VIRTUAL FITTING ROOM',
      title: 'TRY BEFORE YOU BUY.',
      subtitle: 'Eliminate fit uncertainty. Preview garments on interactive 3D mannequins with real-time silhouette drape.',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: { text: 'LAUNCH 3D TRY-ON', to: '/try-on' },
      secondaryBtn: { text: 'FIND MY SIZE', to: '/body-scan' },
      accent: '#34D399'
    },
    {
      id: 4,
      badge: 'ATELIER RUNWAY DROPS',
      title: 'EXCLUSIVE AUCTIONS.',
      subtitle: 'Bid live on limited-edition runway sample pieces and archive drops authenticated by our master tailors.',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85',
      primaryBtn: { text: 'LIVE AUCTIONS', to: '/auctions' },
      secondaryBtn: { text: 'VIEW SALE', to: '/shop?sort=better-discount' },
      accent: '#FBBF24'
    }
  ];

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  useEffect(() => {
    Promise.all([
      productService.getProducts({ page: 1, limit: 12, sort: 'newest' }),
      productService.getProducts({ page: 1, limit: 12, sort: 'popular' }),
      auctionService.getAuctions()
    ])
      .then(([newRes, trendRes, auctionsRes]) => {
        setNewArrivals(newRes.data || []);
        setTrendingProducts(trendRes.data || []);
        setActiveAuctions(auctionsRes || []);
      })
      .catch((err) => console.error('Error fetching homepage data:', err))
      .finally(() => setLoading(false));
  }, []);

  const compactCategories = [
    {
      name: 'Men',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=400&q=80',
      to: '/shop?gender=Men'
    },
    {
      name: 'Women',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
      to: '/shop?gender=Women'
    },
    {
      name: 'Kids',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=400&q=80',
      to: '/shop?gender=Kids'
    },
    {
      name: 'Shirts',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=shirts'
    },
    {
      name: 'T-Shirts',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=t-shirts'
    },
    {
      name: 'Dresses',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=dresses'
    },
    {
      name: 'Jeans',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=jeans'
    },
    {
      name: 'Jackets',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=jackets'
    },
    {
      name: 'Hoodies',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=hoodies'
    },
    {
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80',
      to: '/shop?category=shoes-accessories'
    }
  ];

  const featuredBrands = [
    { name: 'Roadster', tag: 'Denim & Streetwear' },
    { name: 'HRX', tag: 'Active & Athletic' },
    { name: 'Mast & Harbour', tag: 'Contemporary Smart' },
    { name: 'HERE&NOW', tag: 'Youth Trends' },
    { name: 'WROGN', tag: 'Edgy Casual' },
    { name: 'Tokyo Talkies', tag: 'Womenswear' },
    { name: 'DressBerry', tag: 'Chic Feminine' },
    { name: 'Levis', tag: 'Iconic Denim' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 bg-white">
      {/* 1. Fashion Hero Banner Carousel (Slideshow) */}
      <section className="fashion-container pt-2 sm:pt-3">
        <div
          className="relative overflow-hidden rounded-2xl bg-[#111111] text-white h-[360px] sm:h-[420px] md:h-[460px] lg:h-[480px] shadow-sm select-none group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slides Container */}
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                {/* Gradient Overlay for high readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent sm:from-black/85 sm:via-black/40 sm:to-black/10" />

                {/* Slide Text Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-6 sm:px-12 md:px-14 lg:px-16 max-w-xl space-y-3 sm:space-y-4">
                    <span
                      className="inline-block text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                      style={{ color: slide.accent }}
                    >
                      {slide.badge}
                    </span>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight uppercase">
                      {slide.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-gray-200 font-normal leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <Link
                        to={slide.primaryBtn.to}
                        className="px-6 py-2.5 bg-white text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all shadow-sm active:scale-95"
                      >
                        {slide.primaryBtn.text}
                      </Link>
                      <Link
                        to={slide.secondaryBtn.to}
                        className="px-6 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider rounded-lg backdrop-blur-md border border-white/30 transition-all active:scale-95"
                      >
                        {slide.secondaryBtn.text}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Previous Arrow Button */}
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
            aria-label="Next slide"
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicator Dots / Pills */}
          <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
            {heroSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                className={`transition-all duration-300 rounded-full h-2 ${dotIdx === currentSlide
                  ? 'w-7 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Shop By Category (Compact Grid with Rounded Cards) */}
      <section className="fashion-container">
        <div className="border-b border-[#EAEAEC] pb-2 mb-3.5 flex items-baseline justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#111111]">
              Shop By Category
            </h2>
            <p className="text-[11px] sm:text-xs text-[#7E818C]">Explore curated fashion apparel & accessories</p>
          </div>
          <Link
            to="/shop"
            className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1 uppercase"
          >
            All Categories <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 10-Item Compact Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {compactCategories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.to}
              className="group block relative overflow-hidden rounded-xl border border-[#EAEAEC] bg-white hover:border-[#111111] hover:shadow-sm transition-all"
            >
              <div className="aspect-[4/5] w-full bg-[#F5F5F6] overflow-hidden rounded-t-xl">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
              <div className="p-1.5 text-center bg-white border-t border-[#F5F5F6]">
                <h3 className="text-[11px] font-bold text-[#282C3F] group-hover:text-[#111111] truncate">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals (12-product dense 4-column grid with Rounded Cards) */}
      <section className="fashion-container">
        <div className="border-b border-[#EAEAEC] pb-2 mb-3.5 flex items-baseline justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#111111]">
              New Arrivals
            </h2>
            <p className="text-[11px] sm:text-xs text-[#7E818C]">Latest styles recently added to the catalog</p>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1 uppercase"
          >
            VIEW ALL <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[4/5] bg-[#F5F5F6] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {newArrivals.slice(0, 12).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Trending Now (12-product dense 4-column grid with Rounded Cards) */}
      <section className="fashion-container">
        <div className="border-b border-[#EAEAEC] pb-2 mb-3.5 flex items-baseline justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#111111]">
              Trending Now
            </h2>
            <p className="text-[11px] sm:text-xs text-[#7E818C]">Most popular and highly-rated pieces</p>
          </div>
          <Link
            to="/shop?sort=popular"
            className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1 uppercase"
          >
            VIEW ALL <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {trendingProducts.slice(0, 12).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Featured Brands Showcase (Rounded Cards) */}
      <section className="fashion-container">
        <div className="border-b border-[#EAEAEC] pb-2 mb-3.5">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#111111]">
            Featured Brands
          </h2>
          <p className="text-[11px] sm:text-xs text-[#7E818C]">Shop top marketplace labels and designer collections</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {featuredBrands.map((b) => (
            <Link
              key={b.name}
              to={`/shop?brand=${encodeURIComponent(b.name)}`}
              className="p-3 text-center border border-[#EAEAEC] rounded-xl bg-white hover:border-[#111111] hover:shadow-sm transition"
            >
              <p className="text-xs font-black uppercase tracking-wider text-[#111111] truncate">{b.name}</p>
              <p className="text-[10px] text-[#7E818C] mt-0.5 truncate">{b.tag}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Try-On & Sizing Assistant Feature (Rounded Banner) */}
      <section className="fashion-container">
        <div className="relative overflow-hidden rounded-2xl border border-[#EAEAEC] bg-[#F9FAFB] p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF3F6C] px-2.5 py-0.5 bg-[#FFF0F4] rounded-full inline-block">
              VIRTUAL FITTING ASSISTANT
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#111111]">
              Try It On & Find Your Size
            </h3>
            <p className="text-xs text-[#535665] leading-relaxed">
              Experience our interactive 3D fitting room to preview garment silhouettes, test color options, and calibrate recommended sizes based on your measurements.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link
                to="/try-on"
                className="px-4 py-2 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-black transition flex items-center gap-1.5 shadow-sm"
              >
                <FiBox className="text-xs text-[#FF3F6C]" />
                Launch 3D Try-On
              </Link>
              <Link
                to="/body-scan"
                className="px-4 py-2 border border-[#D4D5D9] bg-white text-[#111111] font-bold text-xs uppercase tracking-wider rounded-lg hover:border-[#111111] transition shadow-sm"
              >
                Find My Size
              </Link>
            </div>
          </div>

          <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden bg-white border border-[#EAEAEC] shrink-0 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
              alt="Virtual Dressing Preview"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* 7. Live Runway Auctions (Rounded Cards) */}
      {activeAuctions.length > 0 && (
        <section className="fashion-container">
          <div className="border-b border-[#EAEAEC] pb-2 mb-3.5 flex items-baseline justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#111111]">
                Runway Drops & Auctions
              </h2>
              <p className="text-[11px] sm:text-xs text-[#7E818C]">Exclusive archive drops with live bidding</p>
            </div>
            <Link
              to="/auctions"
              className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1 uppercase"
            >
              All Drops <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeAuctions.slice(0, 3).map((auction) => (
              <div
                key={auction._id}
                className="flex border border-[#EAEAEC] rounded-xl bg-white overflow-hidden hover:border-[#111111] hover:shadow-sm transition"
              >
                <div className="w-24 sm:w-28 aspect-[4/5] bg-[#F5F5F6] shrink-0 rounded-l-xl overflow-hidden">
                  <img
                    src={auction.product?.images?.[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80'}
                    alt={auction.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#FFF0F4] text-[#FF3F6C] rounded-full">
                      LIVE
                    </span>
                    <h4 className="font-bold text-xs text-[#111111] mt-1 line-clamp-1">
                      {auction.title}
                    </h4>
                    <p className="text-[11px] text-[#7E818C] mt-0.5">
                      Current: <strong className="text-[#111111]">₹{auction.currentPrice?.toLocaleString()}</strong>
                    </p>
                  </div>
                  <Link
                    to={`/auctions/${auction._id}`}
                    className="text-center py-1.5 bg-[#111111] text-white font-bold text-[11px] uppercase tracking-wider rounded-lg hover:bg-black transition mt-2 shadow-sm"
                  >
                    Bid Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
