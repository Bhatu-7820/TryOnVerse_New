const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  brand: { type: String, required: true, default: 'TryOnVerse Atelier' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  images: [{ type: String }],
  sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] }],
  colors: [colorSchema],
  stock: { type: Number, required: true, default: 10, min: 0 },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 12 },
  featured: { type: Boolean, default: false },
  gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], default: 'Men' },
  subCategory: { type: String, default: 'Casual' },
  material: { type: String, default: '100% Cotton' },
  fit: { type: String, default: 'Regular Fit' },
  discount: { type: Number, default: 0 },
  tags: [{ type: String }],
  model3DUrl: { type: String }, // GLB model URL or built-in 3D mesh identifier
  tryOnType: { type: String, enum: ['tshirt', 'hoodie', 'jacket', 'dress', 'pants', 'accessory'], default: 'tshirt' },
  sizeChart: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      XS: { chest: '86-91cm', waist: '71-76cm', hips: '86-91cm' },
      S:  { chest: '91-96cm', waist: '76-81cm', hips: '91-96cm' },
      M:  { chest: '96-101cm', waist: '81-86cm', hips: '96-101cm' },
      L:  { chest: '101-106cm', waist: '86-91cm', hips: '101-106cm' },
      XL: { chest: '106-111cm', waist: '91-96cm', hips: '106-111cm' },
      XXL:{ chest: '111-116cm', waist: '96-101cm', hips: '111-116cm' },
    }
  }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text', subCategory: 'text', gender: 'text' });

module.exports = mongoose.model('Product', productSchema);
