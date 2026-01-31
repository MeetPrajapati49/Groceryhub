import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, unique: true, sparse: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, min: 0 }, // For profit calculations
  category: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  active: { type: Boolean, default: true },
  rating: {
    average: { type: Number, default: 4.5, min: 0, max: 5 },
    count: { type: Number, default: 100, min: 0 }
  },
  attributes: {
    weight: Number, // in grams
    unit: { type: String, enum: ['kg', 'g', 'l', 'ml', 'pieces'], default: 'pieces' },
    brand: String,
    origin: String,
    shelfLife: Number, // in days
    isOrganic: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false }
  },
  variants: [{
    sku: String,
    name: String, // e.g., "1kg Pack", "500g Pack"
    price: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    attributes: {
      size: String,
      color: String,
      weight: Number
    }
  }],
  tags: [{ type: String }],
  taxClass: { type: String, default: 'standard' },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: String
  }
}, { timestamps: true });

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ active: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

export default mongoose.model('Product', productSchema);
