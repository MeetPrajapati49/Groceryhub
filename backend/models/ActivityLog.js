import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'export', 'import'],
    required: true
  },
  resourceType: {
    type: String,
    enum: ['product', 'order', 'user', 'category', 'coupon', 'inventory'],
    required: true
  },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  oldValue: { type: mongoose.Schema.Types.Mixed }, // Store previous state
  newValue: { type: mongoose.Schema.Types.Mixed }, // Store new state
  description: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Indexes
activityLogSchema.index({ adminId: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });
activityLogSchema.index({ action: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);
