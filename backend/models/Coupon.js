import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['fixed', 'percentage'], required: true },
  value: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, min: 1 }, // Total usage limit
  usedCount: { type: Number, default: 0 },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: { type: Number }, // For percentage coupons
  applicableCategories: [{ type: String }], // Category names
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ active: 1 });
couponSchema.index({ endDate: 1 });

export default mongoose.model('Coupon', couponSchema);
