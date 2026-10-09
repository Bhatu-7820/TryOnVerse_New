const Design = require('../models/Design');
const Notification = require('../models/Notification');

exports.saveDesign = async (req, res, next) => {
  try {
    const { title, template, baseColor, canvasData, previewImage, status = 'SAVED', notes } = req.body;

    const design = await Design.create({
      userId: req.user.id,
      title: title || 'Custom Atelier Creation',
      template: template || req.body.garmentType || 'tshirt',
      baseColor: baseColor || '#ffffff',
      canvasData: canvasData || {},
      previewImage: previewImage || '',
      status,
      notes
    });

    res.status(201).json({ success: true, data: design });
  } catch (err) {
    next(err);
  }
};

exports.getMyDesigns = async (req, res, next) => {
  try {
    const designs = await Design.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: designs });
  } catch (err) {
    next(err);
  }
};

exports.getDesignById = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    if (design.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: design });
  } catch (err) {
    next(err);
  }
};

exports.updateDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    if (design.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, baseColor, canvasData, previewImage, status, notes } = req.body;
    if (title) design.title = title;
    if (baseColor) design.baseColor = baseColor;
    if (canvasData) design.canvasData = canvasData;
    if (previewImage) design.previewImage = previewImage;
    if (status) design.status = status;
    if (notes) design.notes = notes;

    await design.save();
    res.status(200).json({ success: true, data: design });
  } catch (err) {
    next(err);
  }
};

exports.deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    if (design.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Design.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Design deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.requestQuote = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    design.status = 'REQUEST_QUOTE';
    await design.save();

    await Notification.create({
      userId: req.user.id,
      title: 'Production Quote Requested',
      message: `Your custom design "${design.title}" has been submitted to master tailors for quotation.`,
      type: 'design',
      link: `/designer`
    });

    res.status(200).json({ success: true, message: 'Custom quotation request submitted', data: design });
  } catch (err) {
    next(err);
  }
};
