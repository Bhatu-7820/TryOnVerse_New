import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import { bodyScanService } from '@/services/bodyScanService';
import ProductCard from '@/components/ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlistItem } from '@/store/slices/wishlistSlice';
import {
  FiHeart,
  FiShoppingBag,
  FiBox,
  FiStar,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiCheck,
  FiInfo,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Size Chart & Fit Assistance Modal
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [sizeRec, setSizeRec] = useState(null);

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item) === product?._id
  );

  useEffect(() => {
    setLoading(true);
    productService.getProduct(id)
      .then((res) => {
        if (res.data) {
          setProduct(res.data);
          setRelated(res.related || []);
          if (res.data.sizes?.length) setSelectedSize(res.data.sizes[0]);
          if (res.data.colors?.length) setSelectedColor(res.data.colors[0]);
        }
      })
      .catch(() => toast.error('Failed to load product details'))
      .finally(() => setLoading(false));

    if (user) {
      bodyScanService.getRecommendation(id)
        .then((res) => {
          if (res && res.hasScan) {
            setSizeRec(res);
            if (res.recommendedSize) setSelectedSize(res.recommendedSize);
          }
        })
        .catch(() => {});
    }
  }, [id, user]);

  if (loading || !product) {
    return (
      <div className="fashion-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-[4/5] bg-[#F5F5F6] rounded-[4px]" />
          <div className="space-y-4">
            <div className="h-6 bg-[#F5F5F6] w-1/3 rounded" />
            <div className="h-8 bg-[#F5F5F6] w-2/3 rounded" />
            <div className="h-6 bg-[#F5F5F6] w-1/4 rounded" />
            <div className="h-24 bg-[#F5F5F6] rounded" />
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to bag');
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        size: selectedSize,
        color: selectedColor?.name || 'Standard',
        quantity,
      })
    )
      .unwrap()
      .then(() => toast.success(`Added ${product.name} (${selectedSize}) to Bag`))
      .catch((err) => toast.error(err || 'Failed to add item'));
  };

  const handleToggleWishlist = () => {
    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'];

  return (
    <div className="fashion-container py-4 sm:py-8 space-y-12 bg-white">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#111111]">Clothing</Link>
        <span>/</span>
        <span className="text-[#111111] font-semibold">{product.brand || 'TryOnVerse'}</span>
        <span>/</span>
        <span className="text-[#535665] truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (Thumbs + Big Image) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[620px] pb-2 sm:pb-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border transition-all ${
                    selectedImage === idx
                      ? 'border-[#FF3F6C] shadow-sm'
                      : 'border-[#EAEAEC] opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx}`}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary Viewport Image */}
          <div className="relative flex-1 aspect-[4/5] bg-[#F5F5F6] rounded-xl overflow-hidden border border-[#EAEAEC] shadow-sm">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <button
              onClick={() => navigate(`/try-on?garment=${product.tryOnType || 'tshirt'}&productId=${product._id}`)}
              className="absolute top-3 left-3 bg-white/95 text-[#111111] border border-[#EAEAEC] text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-[#111111] hover:text-white transition-colors"
            >
              <FiBox className="w-3.5 h-3.5 text-[#FF3F6C]" />
              3D Try-On
            </button>
          </div>
        </div>

        {/* Right Column: Product Purchase Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Title */}
          <div className="border-b border-[#EAEAEC] pb-4 space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#111111]">
              {product.brand || 'TRYONVERSE'}
            </h1>
            <p className="text-base sm:text-lg text-[#535665] font-normal leading-snug">
              {product.name}
            </p>

            {/* Rating pill */}
            <div className="inline-flex items-center gap-1.5 border border-[#EAEAEC] rounded-md px-2.5 py-1 text-xs font-bold text-[#111111] mt-2">
              <span>{product.rating || '4.3'}</span>
              <FiStar className="w-3.5 h-3.5 fill-[#14958F] text-[#14958F]" />
              <span className="text-[#94969F] font-normal border-l border-[#EAEAEC] pl-1.5 ml-0.5">
                {product.reviewsCount || '1.4k'} Ratings
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#7E818C] line-through font-normal">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base font-bold text-[#FF5722]">
                    ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            <p className="text-xs font-bold text-[#03A685]">inclusive of all taxes</p>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Color: <span className="font-normal text-[#535665]">{selectedColor?.name || 'Default'}</span>
              </span>
              <div className="flex items-center gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor?.name === c.name ? 'border-[#FF3F6C] scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Select Size
                </span>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs font-bold text-[#FF3F6C] hover:underline"
                >
                  SIZE CHART
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[48px] h-11 px-3 text-sm font-bold border rounded-lg transition-colors ${
                      selectedSize === sz
                        ? 'border-[#FF3F6C] text-[#FF3F6C] bg-[#FFF0F4]'
                        : 'border-[#D4D5D9] bg-white text-[#282C3F] hover:border-[#111111]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Recommendation / Fit Assistant Widget */}
          <div className="p-3.5 bg-[#F5F5F6] border border-[#EAEAEC] rounded-xl space-y-2 text-xs">
            {sizeRec ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <FiCheck className="text-[#03A685] w-4 h-4" />
                  <span>Size Recommendation: {sizeRec.recommendedSize}</span>
                </div>
                <p className="text-[#696B79]">
                  {sizeRec.reason || 'Calculated from your saved posture measurements and this garment fit chart.'}
                </p>
                <p className="text-[10px] text-[#94969F] italic">Estimated non-medical fit assessment.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-[#111111]">Find your best size</p>
                  <p className="text-[#7E818C] text-[11px]">Estimate size based on height and body landmarks</p>
                </div>
                <Link
                  to="/body-scan"
                  className="px-3 py-1.5 bg-white border border-[#D4D5D9] text-[#111111] font-bold text-[11px] rounded-lg hover:border-[#111111] shrink-0"
                >
                  CHECK FIT
                </Link>
              </div>
            )}
          </div>

          {/* Primary Action Buttons (Add to Bag, Wishlist, Virtual Try-On) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-[#FF3F6C] hover:bg-[#E0355D] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <FiShoppingBag className="w-5 h-5" />
                ADD TO BAG
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`px-5 py-3.5 border rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isWishlisted
                    ? 'border-[#FF3F6C] text-[#FF3F6C] bg-[#FFF0F4]'
                    : 'border-[#D4D5D9] text-[#282C3F] hover:border-[#111111] bg-white'
                }`}
                title="Save to Wishlist"
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-[#FF3F6C]' : ''}`} />
                <span className="hidden sm:inline">WISHLIST</span>
              </button>
            </div>

            {/* Virtual 3D Try-On Feature Button */}
            <button
              onClick={() => navigate(`/try-on?garment=${product.tryOnType || 'tshirt'}&productId=${product._id}`)}
              className="w-full py-3 bg-white border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FiBox className="w-4 h-4 text-[#FF3F6C]" />
              VIRTUAL 3D TRY-ON
            </button>
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="border-t border-[#EAEAEC] pt-4 space-y-3 text-xs text-[#535665]">
            <div className="flex items-center gap-3">
              <FiTruck className="w-4 h-4 text-[#282C3F] shrink-0" />
              <span>Get it delivered in 2–4 business days with complimentary express shipping.</span>
            </div>
            <div className="flex items-center gap-3">
              <FiRefreshCw className="w-4 h-4 text-[#282C3F] shrink-0" />
              <span>Easy 14 days returns and hassle-free exchanges.</span>
            </div>
            <div className="flex items-center gap-3">
              <FiShield className="w-4 h-4 text-[#282C3F] shrink-0" />
              <span>100% Original Products directly verified by TryOnVerse atelier.</span>
            </div>
          </div>

          {/* Product Specifications / Description */}
          <div className="border-t border-[#EAEAEC] pt-4 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">
              Product Details
            </h3>
            <p className="text-xs text-[#696B79] leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-[#EAEAEC]">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#111111] mb-6">
            Similar Styles You May Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.slice(0, 4).map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-[4px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#EAEAEC]">
            <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">Size Chart (in cm)</h3>
              <button onClick={() => setShowSizeChart(false)} className="p-1 text-[#7E818C] hover:text-[#111111]">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F6] border-b border-[#EAEAEC] text-[#111111]">
                  <th className="p-2 font-bold">Size</th>
                  <th className="p-2 font-bold">Chest (cm)</th>
                  <th className="p-2 font-bold">Waist (cm)</th>
                  <th className="p-2 font-bold">Hips (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEC] text-[#535665]">
                <tr><td className="p-2 font-bold text-[#111111]">XS</td><td className="p-2">84–89</td><td className="p-2">68–73</td><td className="p-2">84–89</td></tr>
                <tr><td className="p-2 font-bold text-[#111111]">S</td><td className="p-2">90–95</td><td className="p-2">74–79</td><td className="p-2">90–95</td></tr>
                <tr><td className="p-2 font-bold text-[#111111]">M</td><td className="p-2">96–101</td><td className="p-2">80–85</td><td className="p-2">96–101</td></tr>
                <tr><td className="p-2 font-bold text-[#111111]">L</td><td className="p-2">102–107</td><td className="p-2">86–91</td><td className="p-2">102–107</td></tr>
                <tr><td className="p-2 font-bold text-[#111111]">XL</td><td className="p-2">108–113</td><td className="p-2">92–97</td><td className="p-2">108–113</td></tr>
                <tr><td className="p-2 font-bold text-[#111111]">XXL</td><td className="p-2">114–122</td><td className="p-2">98–106</td><td className="p-2">114–122</td></tr>
              </tbody>
            </table>
            <div className="text-[11px] text-[#7E818C] pt-2">
              Note: Sizing standards follow international apparel fit guidelines with a ±1.5cm tailoring tolerance.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
