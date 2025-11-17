import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String, trim: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  icon: { type: String }, // Icon URL or emoji
  image: { type: String }, // Category banner image
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  seo: {
    metaTitle: String,
    metaDescription: String
  }
}, { timestamps: true });

// Indexes
categorySchema.index({ parentId: 1 });
categorySchema.index({ active: 1 });
categorySchema.index({ sortOrder: 1 });

export default mongoose.model('Category', categorySchema);
