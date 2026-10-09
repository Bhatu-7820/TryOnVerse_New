import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import ProductCard from '@/components/ProductCard';
import {
  FiSliders,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filters from URL query params
  const page = Number(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const selectedSize = searchParams.get('size') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const gender = searchParams.get('gender') || '';
  const brand = searchParams.get('brand') || '';
  const discount = searchParams.get('discount') || '';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Popular brands in catalog
  const availableBrands = [
    'Roadster',
    'HRX',
    'Mast & Harbour',
    'HERE&NOW',
    'WROGN',
    'Tokyo Talkies',
    'DressBerry',
    'Campus Sutra',
    'Nautica',
    'Snitch',
    'Levis',
    'Allen Solly'
  ];

  const priceRanges = [
    { label: 'Under ₹1,000', min: '0', max: '1000' },
    { label: '₹1,000 – ₹2,000', min: '1000', max: '2000' },
    { label: '₹2,000 – ₹3,500', min: '2000', max: '3500' },
    { label: 'Above ₹3,500', min: '3500', max: '' },
  ];

  const discountFilters = [
    { label: '30% and above', val: '30' },
    { label: '40% and above', val: '40' },
    { label: '50% and above', val: '50' },
  ];

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Fetch categories
  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  // Fetch products
  const loadProducts = useCallback(() => {
    setLoading(true);
    const query = {
      page,
      limit: 24, // 24 items per page gives 6 full rows of 4 cards on desktop
      category: currentCategory || undefined,
      gender: gender || undefined,
      brand: brand || undefined,
      discount: discount || undefined,
      search: search || undefined,
      sort,
      size: selectedSize || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    };

    productService
      .getProducts(query)
      .then((res) => {
        setProducts(res.data || []);
        setTotal(res.total || 0);
        setPages(res.pages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, currentCategory, gender, brand, discount, search, sort, selectedSize, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const currentCategoryObj = categories.find((c) => c.slug === currentCategory);
  const pageTitle = search
    ? `Search: "${search}"`
    : currentCategoryObj
    ? currentCategoryObj.name
    : gender
    ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Collection`
    : brand
    ? `${brand} Collection`
    : 'All Fashion Products';

  const hasActiveFilters =
    Boolean(currentCategory || selectedSize || minPrice || maxPrice || gender || brand || discount || search);

  return (
    <div className="fashion-container py-3 sm:py-5 space-y-4 bg-white">
      {/* 1. Breadcrumbs */}
      <nav className="text-[11px] text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#111111]">Shop</Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold">{pageTitle}</span>
      </nav>

      {/* 2. Title & Count Header with Sorting Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEC] pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#111111]">
            {pageTitle}
          </h1>
          <p className="text-xs text-[#7E818C] mt-0.5">
            Showing <span className="font-semibold text-[#111111]">{products.length}</span> of{' '}
            <span className="font-semibold text-[#111111]">{total}</span> items
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-[#D4D5D9] rounded-[2px] text-xs font-bold text-[#282C3F]"
          >
            <FiSliders className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-[#7E818C]">Sort by:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="appearance-none bg-white border border-[#D4D5D9] text-[#282C3F] text-xs font-semibold rounded-[2px] px-2.5 py-1.5 pr-7 focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">What's New</option>
                <option value="popular">Popularity</option>
                <option value="better-discount">Better Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-[#7E818C]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Catalog Grid (Left Filter Sidebar + Right 4-Col Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-4 pr-3 border-r border-[#EAEAEC]">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEC]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-[#FF3F6C] hover:underline uppercase"
              >
                CLEAR ALL
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Gender</h4>
            <div className="space-y-1 text-xs text-[#282C3F]">
              {['Men', 'Women', 'Kids'].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer hover:text-[#111111]">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender.toLowerCase() === g.toLowerCase()}
                    onChange={() => updateParam('gender', gender.toLowerCase() === g.toLowerCase() ? '' : g)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[#F5F5F6]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Categories</h4>
            <div className="space-y-1 text-xs text-[#282C3F] max-h-48 overflow-y-auto pr-1">
              {categories.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 cursor-pointer hover:text-[#111111]">
                  <input
                    type="radio"
                    name="category"
                    checked={currentCategory === c.slug}
                    onChange={() => updateParam('category', currentCategory === c.slug ? '' : c.slug)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <span className="truncate">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[#F5F5F6]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Brand</h4>
            <div className="space-y-1 text-xs text-[#282C3F] max-h-40 overflow-y-auto pr-1">
              {availableBrands.map((b) => (
                <label key={b} className="flex items-center gap-2 cursor-pointer hover:text-[#111111]">
                  <input
                    type="radio"
                    name="brand"
                    checked={brand === b}
                    onChange={() => updateParam('brand', brand === b ? '' : b)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <span className="truncate">{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[#F5F5F6]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Price</h4>
            <div className="space-y-1 text-xs text-[#282C3F]">
              {priceRanges.map((range) => {
                const isSelected = minPrice === range.min && maxPrice === range.max;
                return (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer hover:text-[#111111]">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={isSelected}
                      onChange={() => {
                        const next = new URLSearchParams(searchParams);
                        if (isSelected) {
                          next.delete('minPrice');
                          next.delete('maxPrice');
                        } else {
                          if (range.min) next.set('minPrice', range.min);
                          else next.delete('minPrice');
                          if (range.max) next.set('maxPrice', range.max);
                          else next.delete('maxPrice');
                        }
                        next.set('page', '1');
                        setSearchParams(next);
                      }}
                      className="accent-[#111111] cursor-pointer"
                    />
                    <span>{range.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Discount Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[#F5F5F6]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Discount</h4>
            <div className="space-y-1 text-xs text-[#282C3F]">
              {discountFilters.map((df) => (
                <label key={df.label} className="flex items-center gap-2 cursor-pointer hover:text-[#111111]">
                  <input
                    type="radio"
                    name="discount"
                    checked={discount === df.val}
                    onChange={() => updateParam('discount', discount === df.val ? '' : df.val)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <span>{df.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[#F5F5F6]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Size</h4>
            <div className="flex flex-wrap gap-1">
              {sizesList.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => updateParam('size', isSelected ? '' : sz)}
                    className={`min-w-[32px] h-7 px-1.5 text-[11px] font-semibold border rounded-[2px] transition-colors ${
                      isSelected
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#D4D5D9] bg-white text-[#282C3F] hover:border-[#111111]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-4 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="aspect-[4/5] bg-[#F5F5F6] animate-pulse rounded-[2px]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center space-y-3 border border-[#EAEAEC] rounded-[2px] bg-[#FAFAFA]">
              <p className="font-bold text-sm text-[#111111]">No styles found matching the selected filters.</p>
              <p className="text-xs text-[#7E818C] max-w-sm mx-auto">
                Try selecting different category filters, or clear all filters to see all available styles.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2 bg-[#111111] text-white text-xs font-bold uppercase rounded-[2px] hover:bg-black"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Navigation */}
          {pages > 1 && (
            <div className="pt-6 border-t border-[#EAEAEC] flex items-center justify-between text-xs text-[#282C3F]">
              <span className="text-[#7E818C]">
                Page {page} of {pages} ({total} items total)
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam('page', String(page - 1))}
                  className="px-2.5 py-1.5 border border-[#D4D5D9] rounded-[2px] disabled:opacity-30 hover:border-[#111111] flex items-center gap-1 font-semibold"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>

                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParam('page', String(p))}
                    className={`w-7 h-7 rounded-[2px] text-xs font-bold ${
                      p === page
                        ? 'bg-[#111111] text-white'
                        : 'border border-[#D4D5D9] bg-white hover:border-[#111111]'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page >= pages}
                  onClick={() => updateParam('page', String(page + 1))}
                  className="px-2.5 py-1.5 border border-[#D4D5D9] rounded-[2px] disabled:opacity-30 hover:border-[#111111] flex items-center gap-1 font-semibold"
                >
                  Next <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col z-10 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#7E818C]">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Gender */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase text-[#111111]">Gender</h4>
              <div className="space-y-1 text-xs text-[#282C3F]">
                {['Men', 'Women', 'Kids'].map((g) => (
                  <label key={g} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mGender"
                      checked={gender.toLowerCase() === g.toLowerCase()}
                      onChange={() => updateParam('gender', gender.toLowerCase() === g.toLowerCase() ? '' : g)}
                      className="accent-[#111111]"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase text-[#111111]">Categories</h4>
              <div className="space-y-1 text-xs text-[#282C3F] max-h-40 overflow-y-auto">
                {categories.map((c) => (
                  <label key={c.slug} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mCategory"
                      checked={currentCategory === c.slug}
                      onChange={() => updateParam('category', currentCategory === c.slug ? '' : c.slug)}
                      className="accent-[#111111]"
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Sizes */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase text-[#111111]">Sizes</h4>
              <div className="flex flex-wrap gap-1">
                {sizesList.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => updateParam('size', selectedSize === sz ? '' : sz)}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-[2px] ${
                      selectedSize === sz
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#D4D5D9] bg-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAEAEC] flex gap-2">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2 border border-[#D4D5D9] text-xs font-bold text-[#282C3F] rounded-[2px]"
              >
                CLEAR
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 bg-[#111111] text-white text-xs font-bold rounded-[2px]"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
