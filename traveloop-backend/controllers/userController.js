const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, photoUrl, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (photoUrl) user.photoUrl = photoUrl;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user.addresses || [] });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, zipCode, country, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !zipCode) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    const user = await User.findById(req.user.id);
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (err) {
    next(err);
  }
};
