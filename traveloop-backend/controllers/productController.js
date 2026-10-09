const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      gender,
      brand,
      subCategory,
      discount,
      search,
      minPrice,
      maxPrice,
      size,
      featured,
      sort = 'newest'
    } = req.query;

    const query = {};

    if (category) {
      // Find category by slug, id, or case-insensitive name
      const catList = category.split(',').map(c => c.trim().toLowerCase());
      const catDocs = await Category.find({
        $or: [
          { slug: { $in: catList } },
          { _id: { $in: catList.filter(c => c.match(/^[0-9a-fA-F]{24}$/)) } },
          { name: { $in: catList.map(c => new RegExp(`^${c}$`, 'i')) } }
        ]
      });

      const catIds = catDocs.map(c => c._id);
      const catSlugs = catDocs.map(c => c.slug.toLowerCase());

      const isGenderCat = catSlugs.some(s => ['men', 'women', 'kids'].includes(s));
      const specificCatIds = catDocs
        .filter(c => !['men', 'women', 'kids'].includes(c.slug.toLowerCase()))
        .map(c => c._id);

      const conditions = [];

      // If category is or includes Men, Women, or Kids
      const genderMatches = catSlugs.filter(s => ['men', 'women', 'kids'].includes(s));
      if (genderMatches.length > 0) {
        conditions.push({
          gender: { $in: genderMatches.map(g => new RegExp(`^${g}$`, 'i')) }
        });
      }

      // If specific fashion category IDs were matched
      if (specificCatIds.length > 0) {
        conditions.push({ category: { $in: specificCatIds } });
      } else if (catIds.length > 0 && !isGenderCat) {
        conditions.push({ category: { $in: catIds } });
      }

      // Also match by subCategory or tryOnType if slug matches apparel names
      catList.forEach(s => {
        if (!['men', 'women', 'kids'].includes(s)) {
          const singular = s.replace(/s$/, '');
          conditions.push({ subCategory: new RegExp(singular, 'i') });
          conditions.push({ tryOnType: singular });
        }
      });

      if (conditions.length === 1) {
        Object.assign(query, conditions[0]);
      } else if (conditions.length > 1) {
        query.$or = (query.$or || []).concat(conditions);
      }
    }

    if (gender) {
      const genderList = gender.split(',').map(g => new RegExp(`^${g.trim()}$`, 'i'));
      query.gender = { $in: genderList };
    }

    if (brand) {
      const brandList = brand.split(',').map(b => new RegExp(b.trim(), 'i'));
      query.brand = { $in: brandList };
    }

    if (subCategory) {
      const subList = subCategory.split(',').map(s => new RegExp(s.trim(), 'i'));
      query.subCategory = { $in: subList };
    }

    if (discount) {
      query.discount = { $gte: Number(discount) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (size) {
      const sizeList = size.split(',').map(s => s.trim());
      query.sizes = { $in: sizeList };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'discount' || sort === 'better-discount') sortOption = { discount: -1, salePrice: 1 };
    if (sort === 'popular' || sort === 'popularity') sortOption = { reviewsCount: -1, rating: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products
    });
  } catch (err) {
    next(err);
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true })
      .populate('category', 'name slug')
      .limit(8);
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Fetch related products in the same category
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    }).limit(4);

    res.status(200).json({
      success: true,
      data: product,
      related
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
