import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId }, // For variant-specific changes
  changeQty: { type: Number, required: true }, // Positive for increase, negative for decrease
  reason: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer'],
    required: true
  },
  reference: { type: String }, // Order ID, PO ID, etc.
  notes: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true }
}, { timestamps: true });

// Indexes
inventoryLogSchema.index({ productId: 1, createdAt: -1 });
inventoryLogSchema.index({ adminId: 1 });
inventoryLogSchema.index({ reason: 1 });

export default mongoose.model('InventoryLog', inventoryLogSchema);
