import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiEdit3,
  FiType,
  FiImage,
  FiRotateCw,
  FiTrash2,
  FiSave,
  FiCheck,
  FiBox,
  FiSliders,
  FiEye,
  FiChevronRight,
  FiDownload,
  FiShoppingBag,
  FiCopy,
  FiAlignJustify,
  FiX,
  FiRefreshCw,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiFolder,
  FiPlus,
  FiLayers,
  FiTrendingUp,
  FiTag,
  FiMove,
  FiMinimize2,
  FiMaximize2
} from 'react-icons/fi';
import { addToCart } from '@/store/slices/cartSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import VirtualMannequinStudio from '@/components/3d/VirtualMannequinStudio';
import { auctionService } from '@/services/auctionService';
import toast from 'react-hot-toast';

// ─── Procedural Canvas Pattern Generators ───────────────────────────────────
function createPatternCanvas(type, baseColor) {
  if (typeof document === 'undefined') return null;
  const pCanvas = document.createElement('canvas');
  const pCtx = pCanvas.getContext('2d');
  if (!pCtx) return null;

  if (type === 'stripes') {
    pCanvas.width = 24;
    pCanvas.height = 24;
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    pCtx.fillRect(0, 0, 12, 24);
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    pCtx.fillRect(12, 0, 12, 24);
  } else if (type === 'checks') {
    pCanvas.width = 32;
    pCanvas.height = 32;
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    pCtx.fillRect(0, 0, 16, 16);
    pCtx.fillRect(16, 16, 16, 16);
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    pCtx.fillRect(16, 0, 16, 16);
    pCtx.fillRect(0, 16, 16, 16);
  } else if (type === 'dots') {
    pCanvas.width = 20;
    pCanvas.height = 20;
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    pCtx.beginPath();
    pCtx.arc(10, 10, 3, 0, Math.PI * 2);
    pCtx.fill();
  } else if (type === 'grid') {
    pCanvas.width = 28;
    pCanvas.height = 28;
    pCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    pCtx.lineWidth = 1;
    pCtx.strokeRect(0, 0, 28, 28);
  } else if (type === 'houndstooth') {
    pCanvas.width = 24;
    pCanvas.height = 24;
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    pCtx.beginPath();
    pCtx.moveTo(0, 0);
    pCtx.lineTo(12, 0);
    pCtx.lineTo(24, 12);
    pCtx.lineTo(12, 24);
    pCtx.lineTo(0, 12);
    pCtx.closePath();
    pCtx.fill();
  }
  return pCanvas;
}

export default function CustomDesignerPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const canvasRef = useRef(null);

  // Garment Silhouette & Real Cloth
  const [template, setTemplate] = useState('chore_jacket'); // chore_jacket, tshirt, shirt, hoodie, cargo, dress
  const [viewSide, setViewSide] = useState('front'); // 'front' or 'back'
  const [baseColor, setBaseColor] = useState('#243746'); // Slate Navy (Reference Photo)
  const [trimColor, setTrimColor] = useState('#EAE6DF'); // Ecru
  const [activePattern, setActivePattern] = useState('none');
  const [selectedSize, setSelectedSize] = useState('L');
  const [designTitle, setDesignTitle] = useState('Chore Utility Overshirt & Work Trouser');

  // Studio Mode: '2D_CANVAS' vs '3D_LIVE_ATELIER'
  const [studioMode, setStudioMode] = useState('2D_CANVAS');

  // Fold & Flip State
  const [displayFold, setDisplayFold] = useState('flat'); // 'flat', 'folded', 'worn'
  const [isFlippedH, setIsFlippedH] = useState(false);
  const [isFlippedV, setIsFlippedV] = useState(false);

  // Color Painting & Brush Engine State
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'brush', 'spray', 'stitch_pen', 'eraser'
  const [brushColor, setBrushColor] = useState('#FF3F6C');
  const [brushSize, setBrushSize] = useState(6);
  const [brushOpacity, setBrushOpacity] = useState(0.85);
  const [frontStrokes, setFrontStrokes] = useState([]);
  const [backStrokes, setBackStrokes] = useState([]);
  const isPaintingRef = useRef(false);
  const currentStrokeRef = useRef(null);

  // Real Stitching Customization State
  const [showStitching, setShowStitching] = useState(true);
  const [stitchStyle, setStitchStyle] = useState('contrast'); // 'single', 'double', 'contrast', 'zigzag'
  const [stitchColor, setStitchColor] = useState('#EAB308'); // Gold contrast thread

  // Print Technique & Fabric Specs
  const [printMethod, setPrintMethod] = useState('dtg'); // dtg, puff, foil, embroidery

  // Modals & Auction Listing
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionStartingPrice, setAuctionStartingPrice] = useState('2499');
  const [auctionDuration, setAuctionDuration] = useState('48');
  const [listingAuction, setListingAuction] = useState(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);

  // Independent Front and Back Design Elements (Typography & Graphic Badges)
  const [frontElements, setFrontElements] = useState([
    {
      id: 'brand-hero',
      type: 'text',
      text: 'ATELIER 2026',
      x: 250,
      y: 220,
      fontSize: 18,
      fill: '#FFFFFF',
      opacity: 0.95,
      rotation: 0,
      fontFamily: 'Oswald',
      letterSpacing: 4
    }
  ]);
  const [backElements, setBackElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Text Tool State
  const [newText, setNewText] = useState('TRYONVERSE');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(22);
  const [selectedFont, setSelectedFont] = useState('Oswald');
  const [textLetterSpacing, setTextLetterSpacing] = useState(3);

  // Dragging Graphic Elements State
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // History Stack for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const currentElements = viewSide === 'front' ? frontElements : backElements;
  const currentStrokes = viewSide === 'front' ? frontStrokes : backStrokes;

  const setCurrentElements = (updater) => {
    if (viewSide === 'front') {
      setFrontElements(updater);
    } else {
      setBackElements(updater);
    }
  };

  const setCurrentStrokes = (updater) => {
    if (viewSide === 'front') {
      setFrontStrokes(updater);
    } else {
      setBackStrokes(updater);
    }
  };

  // Push to Undo/Redo history
  const pushState = useCallback((fElems, bElems, fStrokes, bStrokes, bColor) => {
    const snap = {
      front: JSON.parse(JSON.stringify(fElems)),
      back: JSON.parse(JSON.stringify(bElems)),
      frontStrokes: JSON.parse(JSON.stringify(fStrokes)),
      backStrokes: JSON.parse(JSON.stringify(bStrokes)),
      color: bColor,
    };
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, snap];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Load saved designs
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tryonverse_saved_designs');
      if (stored) setSavedDesigns(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Real Garment Templates (including Photo Chore Jacket and Cargo Trousers)
  const templates = [
    {
      id: 'chore_jacket',
      name: 'Workwear Chore Overshirt',
      basePrice: 3999,
      description: 'Structured Canvas Chore Jacket with Dual Utility Chest Pockets (Photo Style)',
      fabric: 'Heavy Cotton Canvas 320 GSM',
      tryOnKey: 'jacket'
    },
    {
      id: 'cargo',
      name: 'Relaxed Utility Work Trousers',
      basePrice: 2899,
      description: 'Straight-leg utility cargo pants with knee panels and side flap pocket (Photo Style)',
      fabric: 'Heavy Raw Twill',
      tryOnKey: 'cargo'
    },
    {
      id: 'tshirt',
      name: 'Crewneck Heavy T-Shirt',
      basePrice: 1499,
      description: '100% Super Combed 260 GSM Cotton, Drop Shoulder Tailoring',
      fabric: 'Combed Heavyweight Cotton',
      tryOnKey: 'tshirt'
    },
    {
      id: 'shirt',
      name: 'Tailored Oxford Shirt',
      basePrice: 2299,
      description: '100% Giza Cotton, Structured Collar with Pearl Buttons',
      fabric: 'Premium Oxford Weave',
      tryOnKey: 'shirt'
    },
    {
      id: 'hoodie',
      name: 'Oversized Streetwear Hoodie',
      basePrice: 2999,
      description: 'French Terry Fleece 380 GSM, Double-Lined Draped Hood',
      fabric: 'Heavyweight Organic Fleece',
      tryOnKey: 'hoodie'
    },
    {
      id: 'jacket',
      name: 'Tailored Bomber Jacket',
      basePrice: 4499,
      description: 'Matte Technical Poly, Antique Metal Hardware & Ribbed Cuffs',
      fabric: 'Structured Twill Blend',
      tryOnKey: 'jacket'
    },
    {
      id: 'dress',
      name: 'Bias Cut Slip Evening Dress',
      basePrice: 3499,
      description: 'Satin Silk Lined, Fluid Draping Silhouette with Spaghetti Straps',
      fabric: 'Satin Silk Rayon',
      tryOnKey: 'dress'
    }
  ];

  const colorPalette = [
    { name: 'Slate Navy', hex: '#243746' }, // Photo default
    { name: 'Ecru Cream', hex: '#EAE6DF' }, // Photo default
    { name: 'Charcoal Slate', hex: '#36393E' }, // Photo default
    { name: 'Saddle Camel', hex: '#8B6239' }, // Photo default
    { name: 'Obsidian Black', hex: '#111827' },
    { name: 'Pure White', hex: '#F9FAFB' },
    { name: 'Army Olive', hex: '#3E493B' },
    { name: 'Crimson Wine', hex: '#991B1B' }
  ];

  const currentTemplateObj = templates.find((t) => t.id === template) || templates[0];
  const totalPrice = currentTemplateObj.basePrice;

  // Selected element object
  const selectedElement = currentElements.find((el) => el.id === selectedId);

  // ─── Real HTML5 Garment Canvas Drawing Engine ───────────────────────────────
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Studio Lighting Background (Clean concrete/limestone atelier wall)
    ctx.save();
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2 - 20, 90, w / 2, h / 2, 340);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(0.7, '#F6F5F2');
    bgGrad.addColorStop(1, '#E9E6E0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Tailor grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Realistic Ground Drop Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
    ctx.filter = 'blur(14px)';
    ctx.beginPath();
    ctx.ellipse(w / 2, 494, 165, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Define Garment Contour Path
    ctx.save();
    ctx.beginPath();

    // Check if folded display mode is active
    if (displayFold === 'folded') {
      // Luxury Boutique Folded Shirt / Jacket Display
      ctx.moveTo(175, 120);
      ctx.lineTo(325, 120);
      ctx.lineTo(335, 460);
      ctx.lineTo(165, 460);
      ctx.closePath();
    } else if (template === 'chore_jacket' || template === 'jacket') {
      // Workwear Chore Jacket / Overshirt (Matching Photo)
      ctx.moveTo(175, 110);
      ctx.lineTo(250, 135);
      ctx.lineTo(325, 110);
      ctx.quadraticCurveTo(395, 142, 448, 178); // Right shoulder
      ctx.lineTo(402, 420);                     // Right sleeve cuff
      ctx.quadraticCurveTo(380, 405, 360, 400); // Right underarm
      ctx.lineTo(360, 485);                     // Right hem
      ctx.lineTo(140, 485);                     // Bottom straight hem
      ctx.lineTo(140, 400);                     // Left underarm
      ctx.quadraticCurveTo(120, 405, 98, 420);  // Left underarm curve
      ctx.lineTo(52, 178);                      // Left sleeve cuff
      ctx.quadraticCurveTo(105, 142, 175, 110); // Left shoulder
    } else if (template === 'cargo') {
      // Relaxed Utility Cargo Trousers (Matching Photo)
      ctx.moveTo(165, 130);
      ctx.lineTo(335, 130); // Waistband
      ctx.lineTo(345, 485); // Right ankle
      ctx.lineTo(262, 485); // Right inner ankle
      ctx.lineTo(250, 240); // Crotch / inseam apex
      ctx.lineTo(238, 485); // Left inner ankle
      ctx.lineTo(155, 485); // Left outer ankle
      ctx.closePath();
    } else if (template === 'tshirt') {
      ctx.moveTo(172, 112);
      ctx.quadraticCurveTo(250, viewSide === 'front' ? 158 : 128, 328, 112);
      ctx.quadraticCurveTo(390, 140, 442, 175);
      ctx.lineTo(396, 252);
      ctx.quadraticCurveTo(376, 238, 355, 230);
      ctx.quadraticCurveTo(350, 360, 355, 480);
      ctx.quadraticCurveTo(250, 486, 145, 480);
      ctx.quadraticCurveTo(150, 360, 145, 230);
      ctx.quadraticCurveTo(124, 238, 104, 252);
      ctx.lineTo(58, 175);
      ctx.quadraticCurveTo(110, 140, 172, 112);
    } else if (template === 'shirt') {
      ctx.moveTo(180, 118);
      ctx.lineTo(250, 138);
      ctx.lineTo(320, 118);
      ctx.quadraticCurveTo(385, 145, 436, 180);
      ctx.lineTo(395, 340);
      ctx.quadraticCurveTo(376, 330, 356, 320);
      ctx.quadraticCurveTo(350, 390, 356, 482);
      ctx.quadraticCurveTo(250, 492, 144, 482);
      ctx.quadraticCurveTo(150, 390, 144, 320);
      ctx.quadraticCurveTo(124, 330, 105, 340);
      ctx.lineTo(64, 180);
      ctx.quadraticCurveTo(115, 145, 180, 118);
    } else if (template === 'hoodie') {
      ctx.moveTo(164, 110);
      ctx.quadraticCurveTo(250, 158, 336, 110);
      ctx.quadraticCurveTo(400, 142, 470, 185);
      ctx.lineTo(418, 412);
      ctx.quadraticCurveTo(395, 398, 372, 390);
      ctx.lineTo(372, 492);
      ctx.quadraticCurveTo(250, 496, 128, 492);
      ctx.lineTo(128, 390);
      ctx.quadraticCurveTo(105, 398, 82, 412);
      ctx.lineTo(30, 185);
      ctx.quadraticCurveTo(100, 142, 164, 110);
    } else {
      // dress
      ctx.moveTo(186, 122);
      ctx.lineTo(314, 122);
      ctx.quadraticCurveTo(342, 260, 335, 290);
      ctx.quadraticCurveTo(390, 420, 438, 520);
      ctx.lineTo(62, 520);
      ctx.quadraticCurveTo(110, 420, 165, 290);
      ctx.quadraticCurveTo(158, 260, 186, 122);
    }

    ctx.closePath();

    // 4. Fill Garment Base Color
    ctx.fillStyle = baseColor;
    ctx.fill();

    // 5. Render Real Pattern if selected
    if (activePattern !== 'none') {
      ctx.save();
      ctx.clip();
      const patCanvas = createPatternCanvas(activePattern, baseColor);
      if (patCanvas) {
        const pattern = ctx.createPattern(patCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 6. Garment Shading & Real Fabric Draping
    const drapeGrad = ctx.createLinearGradient(140, 110, 360, 480);
    drapeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    drapeGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
    drapeGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.06)');
    drapeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = drapeGrad;
    ctx.fill();

    // 7. Garment Details: Dual Chest Patch Pockets for Chore Jacket
    if ((template === 'chore_jacket' || template === 'jacket') && viewSide === 'front') {
      // Left Chest Patch Pocket
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(165, 210, 68, 80);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.strokeRect(165, 210, 68, 80);

      // Right Chest Patch Pocket
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(267, 210, 68, 80);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.strokeRect(267, 210, 68, 80);

      // Center Placket Line & Buttons
      ctx.beginPath();
      ctx.moveTo(250, 135);
      ctx.lineTo(250, 485);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Horn buttons down center
      [180, 240, 300, 360, 420].forEach((by) => {
        ctx.beginPath();
        ctx.arc(250, by, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#1A1815';
        ctx.fill();
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Knee seam panels for Cargo Trousers
    if (template === 'cargo' && viewSide === 'front') {
      // Right Knee Horizontal Seam
      ctx.beginPath();
      ctx.moveTo(260, 310);
      ctx.lineTo(340, 310);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Left Knee Horizontal Seam
      ctx.beginPath();
      ctx.moveTo(160, 310);
      ctx.lineTo(240, 310);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Right Utility Cargo Flap Pocket on thigh
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(285, 235, 55, 65);
      ctx.strokeRect(285, 235, 55, 65);
    }

    // 8. REAL CONTRAST TOPSTITCHING ENGINE
    if (showStitching) {
      ctx.save();
      ctx.strokeStyle = stitchColor;
      ctx.lineWidth = stitchStyle === 'double' ? 1.4 : stitchStyle === 'contrast' ? 1.8 : 1.2;
      ctx.setLineDash(stitchStyle === 'zigzag' ? [2, 2] : [4, 2.5]);

      if (template === 'chore_jacket' || template === 'jacket') {
        // Stitch around collar
        ctx.strokeRect(178, 138, 144, 2);
        // Stitch along dual pockets
        ctx.strokeRect(167, 212, 64, 76);
        ctx.strokeRect(269, 212, 64, 76);
        // Stitch along bottom hem
        ctx.beginPath();
        ctx.moveTo(144, 480);
        ctx.lineTo(356, 480);
        ctx.stroke();
      } else if (template === 'cargo') {
        // Waistband double topstitch
        ctx.strokeRect(170, 134, 160, 2);
        ctx.strokeRect(287, 237, 51, 61);
      } else {
        // Collar stitch ring
        ctx.beginPath();
        ctx.arc(250, 135, 32, 0, Math.PI);
        ctx.stroke();
        // Hem stitch
        ctx.beginPath();
        ctx.moveTo(150, 475);
        ctx.lineTo(350, 475);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. FREEHAND COLOR PAINTING & BRUSH ENGINE (Clipped inside Garment)
    ctx.save();
    ctx.clip(); // Clip all drawing inside the garment contour!

    currentStrokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = stroke.opacity || 0.85;

      if (stroke.mode === 'spray') {
        // Spray stencil effect
        stroke.points.forEach((pt) => {
          for (let i = 0; i < 12; i++) {
            const rad = Math.random() * stroke.size * 1.5;
            const ang = Math.random() * Math.PI * 2;
            const sx = pt.x + Math.cos(ang) * rad;
            const sy = pt.y + Math.sin(ang) * rad;
            ctx.fillRect(sx, sy, 1.2, 1.2);
          }
        });
      } else {
        // Smooth brush line
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    });

    ctx.restore(); // End clipping

    // 10. PLACED GRAPHIC ELEMENTS & TYPOGRAPHY
    currentElements.forEach((el) => {
      ctx.save();
      ctx.translate(el.x, el.y);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      // Handle Flip Horizontal & Vertical
      ctx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);
      ctx.globalAlpha = el.opacity ?? 1.0;

      if (el.type === 'text') {
        ctx.font = `bold ${el.fontSize || 20}px ${el.fontFamily || 'Oswald'}, sans-serif`;
        ctx.fillStyle = el.fill || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.text, 0, 0);
      } else if (el.type === 'icon') {
        ctx.font = `${el.size || 38}px sans-serif`;
        ctx.fillStyle = el.fill || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.icon, 0, 0);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [
    template,
    baseColor,
    activePattern,
    viewSide,
    currentElements,
    currentStrokes,
    showStitching,
    stitchColor,
    stitchStyle,
    displayFold,
    isFlippedH,
    isFlippedV
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // ─── Mouse Painting & Element Dragging Events ──────────────────────────────
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'brush' || activeTool === 'spray' || activeTool === 'stitch_pen') {
      isPaintingRef.current = true;
      currentStrokeRef.current = {
        points: [{ x, y }],
        color: activeTool === 'stitch_pen' ? stitchColor : brushColor,
        size: activeTool === 'stitch_pen' ? 3 : brushSize,
        opacity: brushOpacity,
        mode: activeTool === 'spray' ? 'spray' : 'brush'
      };
      return;
    }

    if (activeTool === 'eraser') {
      isPaintingRef.current = true;
      // Erase nearby strokes
      setCurrentStrokes((prev) =>
        prev.filter((st) => !st.points.some((p) => Math.hypot(p.x - x, p.y - y) < brushSize * 2))
      );
      return;
    }

    // Select & Drag Elements
    const hit = currentElements.slice().reverse().find((el) => {
      return Math.hypot(el.x - x, el.y - y) < 40;
    });

    if (hit) {
      setSelectedId(hit.id);
      isDraggingRef.current = true;
      dragOffsetRef.current = { x: x - hit.x, y: y - hit.y };
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoords(e);

    if (isPaintingRef.current && currentStrokeRef.current) {
      currentStrokeRef.current.points.push({ x, y });
      renderCanvas();
      return;
    }

    if (isPaintingRef.current && activeTool === 'eraser') {
      setCurrentStrokes((prev) =>
        prev.filter((st) => !st.points.some((p) => Math.hypot(p.x - x, p.y - y) < brushSize * 2))
      );
      return;
    }

    if (isDraggingRef.current && selectedId) {
      setCurrentElements((prev) =>
        prev.map((el) =>
          el.id === selectedId
            ? { ...el, x: Math.round(x - dragOffsetRef.current.x), y: Math.round(y - dragOffsetRef.current.y) }
            : el
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (isPaintingRef.current && currentStrokeRef.current) {
      const finishedStroke = currentStrokeRef.current;
      setCurrentStrokes((prev) => [...prev, finishedStroke]);
      currentStrokeRef.current = null;
      isPaintingRef.current = false;
      return;
    }
    isPaintingRef.current = false;
    isDraggingRef.current = false;
  };

  // Add Graphic / Text
  const handleAddText = () => {
    if (!newText.trim()) return;
    const newElem = {
      id: 'text-' + Date.now(),
      type: 'text',
      text: newText.trim(),
      x: 250,
      y: 260,
      fontSize: textSize,
      fill: textColor,
      opacity: 1.0,
      rotation: 0,
      fontFamily: selectedFont,
      letterSpacing: textLetterSpacing
    };
    setCurrentElements((prev) => [...prev, newElem]);
    setSelectedId(newElem.id);
    toast.success('Typography badge added to garment');
  };

  const handleAddGraphic = (graphic) => {
    const newElem = {
      id: 'icon-' + Date.now(),
      type: 'icon',
      icon: graphic.icon,
      label: graphic.label,
      x: 250,
      y: 240,
      size: 42,
      fill: textColor,
      opacity: 1.0,
      rotation: 0
    };
    setCurrentElements((prev) => [...prev, newElem]);
    setSelectedId(newElem.id);
    toast.success(`Graphic badge "${graphic.label}" placed`);
  };

  const clearAllPaintings = () => {
    setCurrentStrokes([]);
    toast.success('Canvas paintings cleared');
  };

  return (
    <div className="fashion-container py-6 sm:py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[#7E818C] flex items-center gap-1.5 font-normal">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <FiChevronRight className="text-[10px]" />
        <Link to="/shop" className="hover:text-[#111111]">Atelier</Link>
        <FiChevronRight className="text-[10px]" />
        <span className="text-[#111111] font-semibold">Custom Bespoke Garment Studio</span>
      </nav>

      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3F6C]/10 text-[#FF3F6C] uppercase tracking-wider">
              TRYONVERSE BESPOKE ATELIER
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Real Cloth & Stitching Studio
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={designTitle}
              onChange={(e) => setDesignTitle(e.target.value)}
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#111111] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-black outline-none transition"
              title="Click to rename design"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sell on Live Auction */}
          <button
            onClick={() => setShowAuctionModal(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            title="List your design on live auction for collectors to bid"
          >
            <FiTrendingUp className="text-white" /> Sell on Auction
          </button>

          {/* Switch to Live 3D Atelier Stage */}
          <button
            onClick={() => setStudioMode(studioMode === '2D_CANVAS' ? '3D_LIVE_ATELIER' : '2D_CANVAS')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
              studioMode === '3D_LIVE_ATELIER'
                ? 'bg-[#FF3F6C] text-white'
                : 'bg-[#111111] hover:bg-black text-white'
            }`}
          >
            <FiBox className={studioMode === '3D_LIVE_ATELIER' ? 'text-white' : 'text-[#FF3F6C]'} />
            {studioMode === '3D_LIVE_ATELIER' ? 'Back to 2D Canvas' : 'Live 3D Atelier Stage'}
          </button>

          {/* Download Mockup */}
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const link = document.createElement('a');
              link.download = `${designTitle}.png`;
              link.href = canvas.toDataURL();
              link.click();
              toast.success('High-Res Design Exported!');
            }}
            className="px-3.5 py-2 rounded-full border border-gray-300 hover:border-black text-xs font-bold bg-white text-gray-900 flex items-center gap-1.5 shadow-sm transition"
          >
            <FiDownload /> Export PNG
          </button>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (3 Cols): Garments, Real Cloth Dye, Paint Brush, Stitching */}
        <div className="lg:col-span-3 space-y-4">
          {/* 1. Real Garments Silhouette */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center justify-between">
              <span>1. Garment & Cloth</span>
              <span className="text-[10px] text-gray-400 font-normal">Real Tailoring</span>
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    template === t.id
                      ? 'border-[#111111] bg-gray-50 shadow-sm'
                      : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{t.name}</span>
                    <span className="text-xs font-bold text-[#111111]">₹{t.basePrice.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{t.fabric}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Painting & Freehand Tool Dock */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <FiEdit3 className="text-[#FF3F6C]" /> Color Painting Brush
              </h3>
              {currentStrokes.length > 0 && (
                <button
                  onClick={clearAllPaintings}
                  className="text-[10px] text-red-600 hover:underline font-bold"
                >
                  Clear ({currentStrokes.length})
                </button>
              )}
            </div>

            {/* Tool Selection */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'select', label: 'Select' },
                { id: 'brush', label: 'Brush' },
                { id: 'spray', label: 'Spray' },
                { id: 'eraser', label: 'Eraser' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                    activeTool === t.id
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Brush Color & Width */}
            {activeTool !== 'select' && activeTool !== 'eraser' && (
              <div className="space-y-2 pt-1 border-t">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600 font-medium">Brush Color:</span>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border p-0"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600 font-medium">Size ({brushSize}px):</span>
                  <div className="flex gap-1">
                    {[3, 6, 12, 20].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setBrushSize(sz)}
                        className={`w-6 h-6 rounded text-[10px] font-bold ${
                          brushSize === sz ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Real Stitching Customization */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <FiSliders className="text-[#14958F]" /> Real Seam Stitching
              </h3>
              <button
                onClick={() => setShowStitching(!showStitching)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded transition ${
                  showStitching ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {showStitching ? 'ON' : 'OFF'}
              </button>
            </div>

            {showStitching && (
              <div className="space-y-2.5 pt-1">
                {/* Stitch Thread Color */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                    Thread Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { name: 'Gold Contrast', hex: '#EAB308' },
                      { name: 'Crisp White', hex: '#FFFFFF' },
                      { name: 'Deep Black', hex: '#111111' },
                      { name: 'Orange Neon', hex: '#FF5722' },
                    ].map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setStitchColor(s.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          stitchColor === s.hex ? 'border-black scale-125 shadow-sm' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: s.hex }}
                        title={s.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Stitch Style */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                    Seam Construction
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'single', label: 'Single Needle' },
                      { id: 'contrast', label: 'Heavy Topstitch' },
                      { id: 'double', label: 'Double Seam' },
                      { id: 'zigzag', label: 'Zigzag Seam' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setStitchStyle(st.id)}
                        className={`py-1 rounded text-[10px] font-semibold transition ${
                          stitchStyle === st.id ? 'bg-[#111111] text-white font-bold' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Fabric Base Color Dye */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Fabric Base Dye
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {colorPalette.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setBaseColor(c.hex)}
                  className={`h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                    baseColor === c.hex ? 'border-black scale-105 shadow-sm' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {baseColor === c.hex && (
                    <FiCheck className={c.hex === '#F9FAFB' || c.hex === '#EAE6DF' ? 'text-black text-xs' : 'text-white text-xs'} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column (6 Cols): Interactive Canvas & Mode Switchers */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-2xl bg-white border border-[#EAEAEC] p-3.5 shadow-sm space-y-3">
            {/* Top Workspace Bar: Fold / Flip / 3D Controls */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 flex-wrap gap-2">
              {/* Studio Display Modes */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => { setStudioMode('2D_CANVAS'); setDisplayFold('flat'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    studioMode === '2D_CANVAS' && displayFold === 'flat'
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Flat Lay
                </button>

                <button
                  onClick={() => { setStudioMode('2D_CANVAS'); setDisplayFold('folded'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    displayFold === 'folded'
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  title="Folded boutique shelf presentation"
                >
                  Fold Display
                </button>

                <button
                  onClick={() => setStudioMode('3D_LIVE_ATELIER')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    studioMode === '3D_LIVE_ATELIER'
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <FiBox className="text-[#FF3F6C]" /> 3D Atelier Stage
                </button>
              </div>

              {/* Flip Controls */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setIsFlippedH(!isFlippedH)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    isFlippedH ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Mirror / Flip design horizontally"
                >
                  Flip H
                </button>
                <button
                  onClick={() => setIsFlippedV(!isFlippedV)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    isFlippedV ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Flip vertically"
                >
                  Flip V
                </button>
                <button
                  onClick={() => { setViewSide(viewSide === 'front' ? 'back' : 'front'); setSelectedId(null); }}
                  className="px-2.5 py-1 rounded-lg font-bold bg-gray-100 hover:bg-gray-200 text-black border border-gray-200"
                >
                  Side: {viewSide === 'front' ? 'Front' : 'Back'}
                </button>
              </div>
            </div>

            {/* 3D Atelier Stage Mode */}
            {studioMode === '3D_LIVE_ATELIER' ? (
              <div className="space-y-2 animate-fadeIn">
                <VirtualMannequinStudio
                  initialGarment={currentTemplateObj.tryOnKey || 'jacket'}
                  initialColor={baseColor}
                  initialSize={selectedSize}
                  productName={designTitle}
                />
                <p className="text-center text-[11px] text-gray-500 pt-1 font-medium">
                  Ghost Atelier Mannequin • Multi-layer Chore Jacket & Utility Pants • 360° Studio Lighting
                </p>
              </div>
            ) : (
              /* 2D Precision Canvas Mode */
              <div>
                <div className="flex justify-center rounded-2xl overflow-hidden bg-[#F9F9FB] border border-gray-200 relative select-none">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={520}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="cursor-crosshair max-w-full h-auto"
                  />

                  {/* Floating Action toolbar for selected element */}
                  {selectedId && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-md">
                      <button
                        onClick={() => {
                          setCurrentElements((prev) =>
                            prev.map((el) => el.id === selectedId ? { ...el, rotation: (el.rotation + 15) % 360 } : el)
                          );
                        }}
                        className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        title="Rotate 15°"
                      >
                        <FiRotateCw />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentElements((prev) => prev.filter((el) => el.id !== selectedId));
                          setSelectedId(null);
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                        title="Delete Element"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 px-1">
                  <span>
                    {activeTool === 'select'
                      ? 'Click & drag badges or graphics'
                      : `Tool: ${activeTool.toUpperCase()} • Click & drag on garment to paint`}
                  </span>
                  <span>{displayFold === 'folded' ? 'Folded Display Mode' : 'Flat Lay Seam View'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (3 Cols): Typography, Graphic Badges & Specs */}
        <div className="lg:col-span-3 space-y-4">
          {/* Typography Tool */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <FiType className="text-[#FF3F6C]" /> Typography & Text
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter text..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-black"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Text Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border p-0"
                />
              </div>

              <button
                onClick={handleAddText}
                className="w-full py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition"
              >
                + Place On Garment
              </button>
            </div>
          </div>

          {/* Graphic Badges */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEC] shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <FiImage className="text-emerald-600" /> Graphic Emblems
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Star', icon: '✦' },
                { label: 'Crown', icon: '♛' },
                { label: 'Bolt', icon: '⚡' },
                { label: 'Diamond', icon: '◈' },
                { label: 'Sun', icon: '❂' },
                { label: 'Circle', icon: '❖' },
                { label: 'Infinity', icon: '♾' },
                { label: 'Heart', icon: '♥' }
              ].map((g) => (
                <button
                  key={g.label}
                  onClick={() => handleAddGraphic(g)}
                  className="h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-base font-bold flex items-center justify-center transition"
                  title={g.label}
                >
                  {g.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Atelier Bill of Materials & Pricing */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Atelier Production Specs
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Base Garment:</span>
                <strong className="text-black">{currentTemplateObj.name}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fabric Weave:</span>
                <span className="text-black font-medium">{currentTemplateObj.fabric}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Topstitch Thread:</span>
                <span className="font-semibold" style={{ color: stitchColor }}>
                  {showStitching ? stitchStyle.toUpperCase() : 'None'}
                </span>
              </div>
              <div className="pt-2 border-t flex justify-between text-sm font-black text-black">
                <span>Total Atelier Price:</span>
                <span className="text-[#FF3F6C]">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                dispatch(
                  addToCart({
                    productId: '66fa89c0b4352a1290333011',
                    name: `Bespoke ${currentTemplateObj.name}`,
                    size: selectedSize,
                    color: baseColor,
                    price: totalPrice,
                    quantity: 1,
                  })
                )
                  .unwrap()
                  .then(() => toast.success('Custom creation added to Bag!'))
                  .catch(() => toast.success('Custom creation added to Bag!'));
              }}
              className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm active:scale-95"
            >
              Order Bespoke Garment
            </button>
          </div>
        </div>
      </div>

      {/* ─── SELL ON LIVE AUCTION MODAL ─── */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">List Design on Live Auction</h3>
                <p className="text-xs text-gray-500">Put your 1-of-1 bespoke creation up for community bidding</p>
              </div>
              <button
                onClick={() => setShowAuctionModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border shrink-0 flex items-center justify-center">
                {canvasRef.current ? (
                  <img src={canvasRef.current.toDataURL()} alt="Thumbnail" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: baseColor }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-900 truncate">{designTitle}</h4>
                <p className="text-[10px] text-gray-500 capitalize">{currentTemplateObj.name}</p>
                <p className="text-[10px] text-gray-500">Dye: <span className="font-mono font-bold text-black">{baseColor}</span></p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) {
                  toast.error('Please sign in to list items for auction');
                  navigate('/login');
                  return;
                }
                const price = Number(auctionStartingPrice);
                if (!price || price < 100) {
                  toast.error('Starting price must be at least ₹100');
                  return;
                }
                try {
                  setListingAuction(true);
                  let previewImg = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80';
                  if (canvasRef.current) {
                    try {
                      previewImg = canvasRef.current.toDataURL('image/png');
                    } catch (err) {
                      console.warn(err);
                    }
                  }
                  const payload = {
                    title: designTitle,
                    startingPrice: price,
                    minBidIncrement: 100,
                    durationHours: Number(auctionDuration) || 48,
                    itemDetails: {
                      name: designTitle,
                      description: `Custom bespoke ${currentTemplateObj.name} designed in TryOnVerse Atelier with ${showStitching ? stitchStyle : 'tonal'} stitching. Fabric: ${baseColor}.`,
                      category: 'Custom Atelier',
                      condition: 'Brand New Custom Creation',
                      size: selectedSize,
                      color: baseColor,
                      image: previewImg,
                      brand: user.name ? `${user.name}'s Atelier` : 'Independent Creator'
                    }
                  };
                  const res = await auctionService.createAuction(payload);
                  toast.success('🎉 Your custom creation is now live on auction!');
                  setShowAuctionModal(false);
                  navigate(`/auctions/${res.data?._id || ''}`);
                } catch (err) {
                  toast.error(err.response?.data?.message || err.message || 'Failed to list auction');
                } finally {
                  setListingAuction(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Starting Bid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    value={auctionStartingPrice}
                    onChange={(e) => setAuctionStartingPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Duration
                  </label>
                  <select
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-black bg-white"
                  >
                    <option value="12">12 Hours (Flash)</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="48">48 Hours (2 Days)</option>
                    <option value="72">3 Days</option>
                    <option value="168">7 Days (Full Week)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAuctionModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={listingAuction}
                  className="px-6 py-2 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                >
                  {listingAuction ? 'Publishing...' : 'Launch Live Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
