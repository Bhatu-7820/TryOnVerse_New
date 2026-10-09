const Banner = require('../models/Banner');

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};
