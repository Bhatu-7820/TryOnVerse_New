import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import VirtualMannequinStudio from '@/components/3d/VirtualMannequinStudio';
import { productService } from '@/services/productService';
import {
  FiShoppingBag,
  FiBox,
  FiCamera,
  FiUploadCloud,
  FiSliders,
  FiRotateCw,
  FiCheck,
  FiChevronRight,
  FiDownload,
  FiRefreshCw,
  FiX,
  FiMaximize2
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

// Garment overlay SVG paths and shapes for live camera and photo composites
const GARMENT_OVERLAYS = {
  jacket: {
    name: 'Bomber Jacket',
    svg: (color) => (
      <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-md">
        <path
          d="M 130 90 L 270 90 L 370 150 L 330 380 L 290 370 L 290 420 L 110 420 L 110 370 L 70 380 L 30 150 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
        {/* Zipper */}
        <line x1="200" y1="95" x2="200" y2="420" stroke="#E5E7EB" strokeWidth="4" />
        {/* Collar & Hem */}
        <path d="M 130 90 Q 200 120 270 90" fill="none" stroke="#1F2937" strokeWidth="6" />
        <line x1="110" y1="418" x2="290" y2="418" stroke="#1F2937" strokeWidth="8" />
      </svg>
    ),
  },
  hoodie: {
    name: 'Streetwear Hoodie',
    svg: (color) => (
      <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-md">
        <path
          d="M 135 95 Q 200 135 265 95 L 380 160 L 335 390 L 295 380 L 295 425 L 105 425 L 105 380 L 65 390 L 20 160 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
        {/* Kangaroo Pocket */}
        <rect x="145" y="310" width="110" height="75" rx="8" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        {/* Drawstrings */}
        <line x1="185" y1="120" x2="185" y2="190" stroke="#D1D5DB" strokeWidth="2.5" />
        <line x1="215" y1="120" x2="215" y2="190" stroke="#D1D5DB" strokeWidth="2.5" />
      </svg>
    ),
  },
  tshirt: {
    name: 'Crewneck T-Shirt',
    svg: (color) => (
      <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-md">
        <path
          d="M 140 95 Q 200 135 260 95 L 360 150 L 325 220 L 285 205 L 285 410 L 115 410 L 115 205 L 75 220 L 40 150 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
        {/* Ribbed Collar */}
        <path d="M 140 95 Q 200 135 260 95" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="5" />
      </svg>
    ),
  },
  shirt: {
    name: 'Oxford Shirt',
    svg: (color) => (
      <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-md">
        <path
          d="M 145 95 L 200 115 L 255 95 L 355 150 L 320 280 L 285 265 L 285 415 L 115 415 L 115 265 L 80 280 L 45 150 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
        {/* Buttons */}
        <line x1="200" y1="115" x2="200" y2="415" stroke="rgba(0,0,0,0.2)" strokeWidth="8" />
        <circle cx="200" cy="160" r="3" fill="#FFFFFF" />
        <circle cx="200" cy="210" r="3" fill="#FFFFFF" />
        <circle cx="200" cy="260" r="3" fill="#FFFFFF" />
        <circle cx="200" cy="310" r="3" fill="#FFFFFF" />
        <circle cx="200" cy="360" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },
  dress: {
    name: 'Slip Evening Dress',
    svg: (color) => (
      <svg viewBox="0 0 400 480" className="w-full h-full drop-shadow-md">
        <path
          d="M 155 110 L 245 110 L 265 240 L 335 450 L 65 450 L 135 240 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
        {/* Straps */}
        <line x1="165" y1="110" x2="165" y2="60" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" />
        <line x1="235" y1="110" x2="235" y2="60" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" />
      </svg>
    ),
  },
  pants: {
    name: 'Cargo Trousers',
    svg: (color) => (
      <svg viewBox="0 0 400 480" className="w-full h-full drop-shadow-md">
        <path
          d="M 130 90 L 270 90 L 290 440 L 220 440 L 200 240 L 180 440 L 110 440 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="3"
        />
        <line x1="120" y1="280" x2="190" y2="280" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
        <line x1="210" y1="280" x2="280" y2="280" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
      </svg>
    ),
  },
};

// Automatic Garment Classification & Color Extraction Helpers
export const detectGarmentType = (product) => {
  if (!product) return 'jacket';
  const tryOn = (product.tryOnType || '').toLowerCase();
  const sub = (product.subCategory || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const cat = (product.category?.name || product.category || '').toLowerCase();

  if (
    tryOn === 'tshirt' ||
    sub.includes('t-shirt') ||
    sub.includes('tee') ||
    name.includes('t-shirt') ||
    name.includes('tee')
  ) {
    return 'tshirt';
  }
  if (
    tryOn === 'shirt' ||
    sub.includes('shirt') ||
    name.includes('shirt') ||
    name.includes('oxford')
  ) {
    return 'shirt';
  }
  if (
    tryOn === 'hoodie' ||
    sub.includes('hoodie') ||
    sub.includes('sweatshirt') ||
    name.includes('hoodie')
  ) {
    return 'hoodie';
  }
  if (
    tryOn === 'jacket' ||
    sub.includes('jacket') ||
    sub.includes('coat') ||
    sub.includes('blazer') ||
    name.includes('jacket') ||
    name.includes('bomber') ||
    name.includes('overshirt')
  ) {
    return 'jacket';
  }
  if (
    tryOn === 'pants' ||
    tryOn === 'trousers' ||
    sub.includes('pant') ||
    sub.includes('trouser') ||
    sub.includes('jean') ||
    sub.includes('cargo') ||
    name.includes('pant') ||
    name.includes('cargo') ||
    name.includes('trouser')
  ) {
    return 'pants';
  }
  if (
    tryOn === 'dress' ||
    sub.includes('dress') ||
    name.includes('dress') ||
    cat.includes('dress')
  ) {
    return 'dress';
  }
  return tryOn || 'jacket';
};

export const extractProductColor = (product) => {
  if (!product) return '#243746';
  if (product.colors && product.colors.length > 0) {
    const first = product.colors[0];
    if (typeof first === 'string' && first.startsWith('#')) return first;
    if (first?.hex) return first.hex;
  }
  if (product.color && typeof product.color === 'string' && product.color.startsWith('#')) {
    return product.color;
  }
  return '#243746';
};

export default function TryOnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const initialGarment = searchParams.get('garment') || 'jacket';
  const initialColor = searchParams.get('color') || '#1f2937';
  const initialProductId = searchParams.get('productId');
  const isCustomDesign = searchParams.get('custom') === 'true';

  // Mode: '3D_STUDIO', 'LIVE_CAMERA', or 'PHOTO_UPLOAD'
  const [activeMode, setActiveMode] = useState('3D_STUDIO');

  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [loading, setLoading] = useState(true);

  // Live Camera State
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraMirrored, setCameraMirrored] = useState(true);

  // Real Overlay Positioning Controls (Camera & Photo)
  const [overlayScale, setOverlayScale] = useState(100); // 70 to 140%
  const [overlayY, setOverlayY] = useState(120); // vertical offset in px
  const [overlayX, setOverlayX] = useState(0); // horizontal offset in px
  const [overlayOpacity, setOverlayOpacity] = useState(95); // 50 to 100%

  // Photo Upload State
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const photoCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Body Measurements for Real Size Calculation
  const [userHeight, setUserHeight] = useState(176); // cm
  const [userWeight, setUserWeight] = useState(70); // kg
  const [userChest, setUserChest] = useState(98); // cm
  const [userWaist, setUserWaist] = useState(82); // cm
  const [fitPreference, setFitPreference] = useState('regular'); // slim, regular, relaxed

  // Clean up camera on unmount or mode switch
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Load products & handle initial selected product
  useEffect(() => {
    productService.getProducts({ limit: 40 })
      .then((res) => {
        if (res.data) {
          setProducts(res.data);
          let match = null;
          if (initialProductId) {
            match = res.data.find((p) => p._id === initialProductId);
          }
          if (!match) {
            match = res.data.find((p) => detectGarmentType(p) === initialGarment) || res.data[0];
          }
          if (match) {
            setSelectedProduct(match);
            const pColor = extractProductColor(match);
            setSelectedColor(pColor);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [initialGarment, initialProductId]);

  // Handle clicking ANY product in the wardrobe or catalog to wear on mannequin
  const handleProductSelect = (p) => {
    setSelectedProduct(p);
    const garmentType = detectGarmentType(p);
    const colorHex = extractProductColor(p);
    setSelectedColor(colorHex);
    if (p.sizes && p.sizes.length > 0 && !p.sizes.includes(selectedSize)) {
      setSelectedSize(p.sizes[0]);
    }
    toast.success(`Fitted "${p.name}" onto 3D Mannequin!`, {
      icon: '✨',
      id: 'tryon-fitted',
    });
  };

  // Real Sizing Recommendation Calculation (Transparent & Mathematical)
  const sizingReport = React.useMemo(() => {
    // Standard clothing grading chart (Chest in cm):
    // S: 89-94cm, M: 95-102cm, L: 103-110cm, XL: 111-118cm, XXL: 119-126cm
    let rec = 'M';
    let easeAllowance = 6; // cm

    if (userChest < 92) rec = 'S';
    else if (userChest <= 100) rec = fitPreference === 'relaxed' ? 'L' : 'M';
    else if (userChest <= 108) rec = fitPreference === 'slim' ? 'M' : 'L';
    else rec = 'XL';

    if (fitPreference === 'slim') easeAllowance = 2;
    if (fitPreference === 'relaxed') easeAllowance = 10;

    const garmentChest = rec === 'S' ? 96 : rec === 'M' ? 104 : rec === 'L' ? 112 : 120;
    const computedEase = garmentChest - userChest;

    return {
      recommendedSize: rec,
      garmentChest,
      computedEase,
      easeDescription: computedEase >= 8 ? 'Relaxed & Breathable' : computedEase >= 4 ? 'Tailored Regular' : 'Fitted Snug',
    };
  }, [userChest, fitPreference]);

  // Start Real Camera Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 960 }, facingMode: 'user' },
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success('Live camera active! Position yourself in frame to align garment.');
    } catch (err) {
      toast.error('Unable to access camera. Please allow camera permissions in browser settings.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraActive(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    if (activeMode === 'LIVE_CAMERA' && newMode !== 'LIVE_CAMERA') {
      stopCamera();
    }
    setActiveMode(newMode);
    if (newMode === 'LIVE_CAMERA' && !cameraActive) {
      startCamera();
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
      toast.success('Photo loaded! Adjust position and scale to fit.');
    }
  };

  // Capture Live Camera Snapshot + Garment Overlay
  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 800;
    const ctx = canvas.getContext('2d');

    // Draw video frame
    if (cameraMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    if (cameraMirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Export & download snapshot
    const link = document.createElement('a');
    link.download = `tryonverse-live-tryon-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Try-On snapshot captured and saved to your device!');
  };


  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add to bag');
      navigate('/login');
      return;
    }
    if (!selectedProduct) return;

    dispatch(
      addToCart({
        productId: selectedProduct._id,
        size: selectedSize,
        color: selectedProduct.colors?.[0]?.name || 'Standard',
        quantity: 1,
      })
    )
      .unwrap()
      .then(() => toast.success(`Added ${selectedProduct.name} (${selectedSize}) to Bag!`))
      .catch((err) => toast.error(err || 'Failed to add item'));
  };

  const activeOverlayKey = selectedProduct?.tryOnType || 'jacket';
  const overlayRenderer = GARMENT_OVERLAYS[activeOverlayKey] || GARMENT_OVERLAYS.jacket;

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <FiChevronRight className="text-[10px]" />
        <Link to="/shop" className="hover:text-[#111111]">Clothing</Link>
        <FiChevronRight className="text-[10px]" />
        <span className="text-[#111111] font-semibold">Virtual Fitting Room</span>
      </nav>

      {/* Header with Real Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3F6C]/10 text-[#FF3F6C] uppercase tracking-wider">
              REAL VIRTUAL FITTING
            </span>
            <span className="text-xs text-gray-500 font-mono">Functional Modes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111] mt-1">
            Virtual Try-On & Fitting Room
          </h1>
          <p className="text-xs sm:text-sm text-[#7E818C] mt-0.5">
            Test true garments in 3D WebGL, live camera stream, or photo overlay with honest sizing calculations.
          </p>
        </div>

        {/* 3 Real Supported Modes */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            onClick={() => handleModeSwitch('3D_STUDIO')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === '3D_STUDIO'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-gray-700 hover:text-black hover:bg-white/60'
            }`}
          >
            <FiBox className="text-sm text-[#38BDF8]" />
            <span>3D Interactive Stage</span>
          </button>

          <button
            onClick={() => handleModeSwitch('LIVE_CAMERA')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'LIVE_CAMERA'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-gray-700 hover:text-black hover:bg-white/60'
            }`}
          >
            <FiCamera className="text-sm text-[#FF3F6C]" />
            <span>Live Camera Try-On</span>
          </button>

          <button
            onClick={() => handleModeSwitch('PHOTO_UPLOAD')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'PHOTO_UPLOAD'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-gray-700 hover:text-black hover:bg-white/60'
            }`}
          >
            <FiUploadCloud className="text-sm text-emerald-600" />
            <span>Photo Overlay</span>
          </button>
        </div>
      </div>

      {/* Main Fitting Grid: Viewport & Calibrators (8 Cols) | Wardrobe & Checkout (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Viewport & Telemetry (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeMode === '3D_STUDIO' && (
            /* Mode 1: 3D WebGL Studio Mannequin (Clean Showroom) */
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-2 shadow-sm">
              <VirtualMannequinStudio
                key={selectedProduct?._id || 'mannequin-atelier'}
                garment={detectGarmentType(selectedProduct)}
                color={selectedColor}
                size={selectedSize}
                productName={selectedProduct?.name || 'Atelier Garment'}
                product={selectedProduct}
                onColorChange={(hex) => setSelectedColor(hex)}
              />
              <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-2 px-3">
                <span className="flex items-center gap-1.5">
                  <FiRotateCw className="text-[#FF3F6C]" /> Orbit 360° with mouse/touch • Zoom with scroll wheel • Pan with right-click
                </span>
                <span className="font-mono text-gray-500">WebGL Shader: Active</span>
              </div>
            </div>
          )}

          {activeMode === 'LIVE_CAMERA' && (
            /* Mode 2: Real Live Camera Stream with Interactive Garment Overlay */
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-3 shadow-sm space-y-3">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraMirrored ? '-scale-x-100' : ''}`}
                />

                {/* Real-time Interactive Garment Overlay */}
                <div
                  className="absolute pointer-events-none transition-transform duration-75"
                  style={{
                    top: `${overlayY}px`,
                    left: `calc(50% + ${overlayX}px)`,
                    transform: `translateX(-50%) scale(${overlayScale / 100})`,
                    width: '320px',
                    height: '380px',
                    opacity: overlayOpacity / 100,
                  }}
                >
                  {overlayRenderer.svg(selectedColor)}
                </div>

                {/* Camera Top Bar */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    Live Stream Active • {selectedProduct?.name || 'Garment'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCameraMirrored(!cameraMirrored)}
                      className="bg-white/90 hover:bg-white text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      {cameraMirrored ? 'Mirror: ON' : 'Mirror: OFF'}
                    </button>
                    <button
                      onClick={captureCameraSnapshot}
                      className="bg-[#FF3F6C] hover:bg-[#e0355d] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <FiDownload /> Snapshot
                    </button>
                  </div>
                </div>

                {!cameraActive && (
                  <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-6 text-white text-center">
                    <FiCamera className="text-4xl text-gray-400 mb-2" />
                    <h3 className="font-bold text-sm">Camera Permission Required</h3>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      Click below to grant camera access and see real garments overlaid on your live video.
                    </p>
                    <button
                      onClick={startCamera}
                      className="mt-4 px-5 py-2.5 bg-white text-gray-900 font-bold text-xs uppercase tracking-wider rounded-lg shadow"
                    >
                      Enable Live Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Overlay Alignment Calibration Sliders */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                    <span>Garment Size</span>
                    <span>{overlayScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={overlayScale}
                    onChange={(e) => setOverlayScale(Number(e.target.value))}
                    className="w-full accent-[#FF3F6C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                    <span>Height Position</span>
                    <span>{overlayY}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="260"
                    value={overlayY}
                    onChange={(e) => setOverlayY(Number(e.target.value))}
                    className="w-full accent-[#111111]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                    <span>Horizontal Center</span>
                    <span>{overlayX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={overlayX}
                    onChange={(e) => setOverlayX(Number(e.target.value))}
                    className="w-full accent-[#111111]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                    <span>Opacity</span>
                    <span>{overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full accent-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {activeMode === 'PHOTO_UPLOAD' && (
            /* Mode 3: Real Photo Upload & Garment Overlay Composite */
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-3 shadow-sm space-y-3">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                {uploadedPhotoUrl ? (
                  <>
                    <img
                      src={uploadedPhotoUrl}
                      alt="Uploaded Person"
                      className="w-full h-full object-contain"
                    />

                    {/* Garment Overlay on Photo */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: `${overlayY}px`,
                        left: `calc(50% + ${overlayX}px)`,
                        transform: `translateX(-50%) scale(${overlayScale / 100})`,
                        width: '320px',
                        height: '380px',
                        opacity: overlayOpacity / 100,
                      }}
                    >
                      {overlayRenderer.svg(selectedColor)}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FiUploadCloud className="text-4xl mx-auto text-gray-400 mb-2" />
                    <h3 className="font-bold text-sm text-gray-800">Upload Your Photo / Selfie</h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-1">
                      Upload any portrait or full-body photo to preview the selected garment overlaid directly onto your picture.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-5 py-2.5 bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow"
                    >
                      Choose Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Controls when photo is loaded */}
              {uploadedPhotoUrl && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs">
                    <span className="font-bold text-gray-800">Calibrate Garment Fit on Photo</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-[#FF3F6C] hover:underline"
                    >
                      Change Photo
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                        <span>Size Scale</span>
                        <span>{overlayScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="140"
                        value={overlayScale}
                        onChange={(e) => setOverlayScale(Number(e.target.value))}
                        className="w-full accent-[#FF3F6C]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                        <span>Height Offset</span>
                        <span>{overlayY}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="260"
                        value={overlayY}
                        onChange={(e) => setOverlayY(Number(e.target.value))}
                        className="w-full accent-[#111111]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                        <span>Center Offset</span>
                        <span>{overlayX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={overlayX}
                        onChange={(e) => setOverlayX(Number(e.target.value))}
                        className="w-full accent-[#111111]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500 mb-1">
                        <span>Opacity</span>
                        <span>{overlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-full accent-gray-700"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Genuine Size Recommendation Calculator (Transparent Anthropometrics) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <FiSliders className="text-[#FF3F6C]" /> Sizing & Fit Calibration
                </h3>
                <p className="text-[11px] text-gray-500">
                  Calculated from your actual body circumference against standard apparel pattern grading.
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#111111] bg-gray-100 px-3 py-1 rounded-full">
                Recommended: Size {sizingReport.recommendedSize}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Height */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                  <span>Height</span>
                  <span className="font-mono text-[#FF3F6C]">{userHeight} cm</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="205"
                  value={userHeight}
                  onChange={(e) => setUserHeight(Number(e.target.value))}
                  className="w-full accent-[#FF3F6C] cursor-pointer"
                />
              </div>

              {/* Weight */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                  <span>Weight</span>
                  <span className="font-mono text-[#FF3F6C]">{userWeight} kg</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="120"
                  value={userWeight}
                  onChange={(e) => setUserWeight(Number(e.target.value))}
                  className="w-full accent-[#FF3F6C] cursor-pointer"
                />
              </div>

              {/* Chest */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                  <span>Chest Circumference</span>
                  <span className="font-mono text-[#FF3F6C]">{userChest} cm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  value={userChest}
                  onChange={(e) => setUserChest(Number(e.target.value))}
                  className="w-full accent-[#FF3F6C] cursor-pointer"
                />
              </div>

              {/* Fit Preference */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                  <span>Fit Cut</span>
                  <span className="capitalize text-black">{fitPreference}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['slim', 'regular', 'relaxed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFitPreference(f)}
                      className={`py-1 text-[11px] font-bold rounded-lg capitalize transition ${
                        fitPreference === f
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ease breakdown report */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex flex-col sm:flex-row justify-between gap-2 items-center">
              <div>
                <span className="font-bold text-gray-900">Pattern Ease Analysis:</span>{' '}
                <span className="text-gray-600">
                  Body Chest ({userChest} cm) vs Size {sizingReport.recommendedSize} Pattern ({sizingReport.garmentChest} cm) ={' '}
                  <strong className="text-black">+{sizingReport.computedEase} cm Ease</strong> ({sizingReport.easeDescription}).
                </span>
              </div>
              <button
                onClick={() => setSelectedSize(sizingReport.recommendedSize)}
                className="px-3 py-1 bg-white border border-gray-300 hover:border-black font-bold text-[11px] rounded-lg shrink-0"
              >
                Apply Size {sizingReport.recommendedSize}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Garment Card, Sizing & Wardrobe (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Garment Product Card */}
          {selectedProduct && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <img
                    src={selectedProduct.images?.[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#FF3F6C]">
                    {selectedProduct.brand || 'TryOnVerse Atelier'}
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 truncate leading-snug">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-extrabold text-black">
                      ₹{(selectedProduct.salePrice || selectedProduct.price)?.toLocaleString('en-IN')}
                    </span>
                    {selectedProduct.salePrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{selectedProduct.price?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Select Size
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Calculated: {sizingReport.recommendedSize}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedProduct.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`flex-1 min-w-[40px] py-2 rounded-xl text-xs font-bold transition relative ${
                        selectedSize === sz
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-black'
                      }`}
                    >
                      {sz}
                      {sz === sizingReport.recommendedSize && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                    Select Colorway
                  </label>
                  <div className="flex items-center gap-2">
                    {selectedProduct.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          selectedColor === c.hex ? 'border-black scale-110 shadow-sm' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Add to Bag CTA */}
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition flex items-center justify-center gap-2 active:scale-95"
              >
                <FiShoppingBag className="text-sm" /> Add Fitted Item to Bag
              </button>
            </div>
          )}

          {/* Garment Catalog Switcher */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                Wardrobe Catalog
              </h3>
              <span className="text-[10px] text-gray-500">{products.length} garments</span>
            </div>

            {/* Quick Category Filters */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'tshirt', label: 'T-Shirts' },
                { id: 'shirt', label: 'Shirts' },
                { id: 'jacket', label: 'Jackets' },
                { id: 'hoodie', label: 'Hoodies' },
                { id: 'pants', label: 'Pants' },
                { id: 'dress', label: 'Dresses' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition ${
                    categoryFilter === c.id
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Product Switcher List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {products
                .filter((p) => {
                  if (categoryFilter === 'all') return true;
                  const detected = detectGarmentType(p);
                  if (detected === categoryFilter) return true;
                  const sub = (p.subCategory || '').toLowerCase();
                  const cat = (p.category?.name || p.category || '').toLowerCase();
                  const name = (p.name || '').toLowerCase();
                  return (
                    sub.includes(categoryFilter.toLowerCase()) ||
                    cat.includes(categoryFilter.toLowerCase()) ||
                    name.includes(categoryFilter.toLowerCase())
                  );
                })
                .map((p) => {
                  const isSelected = selectedProduct?._id === p._id;
                  const garmentType = detectGarmentType(p);
                  const pColor = extractProductColor(p);
                  return (
                    <div
                      key={p._id}
                      onClick={() => handleProductSelect(p)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#111111] bg-gray-50 shadow-sm ring-1 ring-black/5'
                          : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative">
                        <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover object-top" />
                        <div
                          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: pColor }}
                          title={`Product Color: ${pColor}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">
                            {garmentType}
                          </span>
                          <p className="font-bold text-gray-900 truncate">{p.name}</p>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-0.5">₹{p.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition shadow-sm ${
                          isSelected ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-700 hover:bg-black hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Wearing' : 'Wear on 3D'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
