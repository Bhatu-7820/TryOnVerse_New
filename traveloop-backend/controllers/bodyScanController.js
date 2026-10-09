const BodyScan = require('../models/BodyScan');
const Product = require('../models/Product');

/**
 * Size Chart reference ranges (in cm):
 * XS:  Chest: 84-89,  Waist: 68-73, Hips: 84-89
 * S:   Chest: 90-95,  Waist: 74-79, Hips: 90-95
 * M:   Chest: 96-101, Waist: 80-85, Hips: 96-101
 * L:   Chest: 102-107,Waist: 86-91, Hips: 102-107
 * XL:  Chest: 108-113,Waist: 92-97, Hips: 108-113
 * XXL: Chest: 114-122,Waist: 98-106,Hips: 114-122
 */
const calculateRecommendedSize = (chest, waist, hips) => {
  if (!chest && !waist) return 'M';
  const c = Number(chest) || (Number(waist) + 15);

  if (c <= 89) return 'XS';
  if (c <= 95) return 'S';
  if (c <= 101) return 'M';
  if (c <= 107) return 'L';
  if (c <= 113) return 'XL';
  return 'XXL';
};

exports.saveBodyScan = async (req, res, next) => {
  try {
    const m = req.body.measurements || req.body;
    const heightCm = m.heightCm || m.height;

    if (!heightCm) {
      return res.status(400).json({
        message: 'Invalid scan data. Height and anthropometric estimations are required.'
      });
    }

    const chestCm = m.chestCm || m.chest;
    const waistCm = m.waistCm || m.waist;
    const hipsCm = m.hipsCm || m.hips;
    const shoulderWidthCm = m.shoulderWidthCm || m.shoulderBreadth || 44;
    const inseamCm = m.inseamCm || m.inseam || 78;

    const recommendedSize = req.body.recommendedSize || calculateRecommendedSize(chestCm, waistCm, hipsCm);

    const bodyScan = await BodyScan.create({
      userId: req.user.id,
      imageUrl: req.body.imageUrl || '',
      measurements: {
        heightCm: Math.round(Number(heightCm)),
        chestCm: Math.round(Number(chestCm || 95)),
        waistCm: Math.round(Number(waistCm || 80)),
        hipsCm: Math.round(Number(hipsCm || 95)),
        shoulderWidthCm: Math.round(Number(shoulderWidthCm)),
        inseamCm: Math.round(Number(inseamCm))
      },
      recommendedSize,
      confidenceScore: req.body.confidenceScore || 0.89,
      scanNotes: req.body.scanNotes || req.body.notes || 'AI visual posture and landmark estimation. Clearly labeled as non-medical approximate estimate.',
      isEstimate: true
    });

    res.status(201).json({ success: true, data: bodyScan });
  } catch (err) {
    next(err);
  }
};

exports.getMyScans = async (req, res, next) => {
  try {
    const scans = await BodyScan.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: scans });
  } catch (err) {
    next(err);
  }
};

exports.getLatestScan = async (req, res, next) => {
  try {
    const latest = await BodyScan.findOne({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: latest });
  } catch (err) {
    next(err);
  }
};

exports.getProductSizeRecommendation = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Look for user's latest scan if logged in
    let userScan = null;
    if (req.user) {
      userScan = await BodyScan.findOne({ userId: req.user.id }).sort('-createdAt');
    }

    if (!userScan) {
      return res.status(200).json({
        success: true,
        hasScan: false,
        message: 'No previous AI body scan found. Run a scan to get tailored size recommendations.'
      });
    }

    const { chestCm, waistCm, hipsCm } = userScan.measurements;
    const recSize = calculateRecommendedSize(chestCm, waistCm, hipsCm);

    const isAvailable = product.sizes.includes(recSize);

    res.status(200).json({
      success: true,
      hasScan: true,
      recommendedSize: recSize,
      isAvailable,
      explanation: `Based on your estimated chest (${chestCm}cm) and waist (${waistCm}cm) from your recent scan, size ${recSize} provides the optimal tailored drape.`,
      measurements: userScan.measurements,
      confidenceScore: userScan.confidenceScore
    });
  } catch (err) {
    next(err);
  }
};
