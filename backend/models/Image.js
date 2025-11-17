import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true }, // in bytes
  path: { type: String, required: true }, // relative path from uploads directory
  url: { type: String, required: true }, // full URL to access the image

  // Image metadata
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },

  // Thumbnails and variants
  thumbnails: [{
    size: { type: String, enum: ['small', 'medium', 'large'], required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    }
  }],

  // Metadata
  alt: { type: String, default: '' },
  caption: { type: String, default: '' },
  tags: [{ type: String }],
  category: { type: String, default: 'general' }, // product, banner, category, etc.

  // Usage tracking
  usage: [{
    type: { type: String, enum: ['product', 'category', 'banner', 'profile'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    referenceModel: { type: String, required: true }
  }],

  // Admin info
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Status
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for better performance
imageSchema.index({ filename: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ category: 1 });
imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ isActive: 1 });
imageSchema.index({ 'usage.referenceId': 1, 'usage.type': 1 });

// Virtual for full URL
imageSchema.virtual('fullUrl').get(function() {
  return `${process.env.BASE_URL || 'http://localhost:5000'}${this.url}`;
});

// Method to add usage
imageSchema.methods.addUsage = function(type, referenceId, referenceModel) {
  // Remove existing usage of same type and reference
  this.usage = this.usage.filter(u => !(u.type === type && u.referenceId.toString() === referenceId.toString()));

  // Add new usage
  this.usage.push({ type, referenceId, referenceModel });
  return this.save();
};

// Method to remove usage
imageSchema.methods.removeUsage = function(type, referenceId) {
  this.usage = this.usage.filter(u => !(u.type === type && u.referenceId.toString() === referenceId.toString()));
  return this.save();
};

// Static method to find unused images
imageSchema.statics.findUnused = function() {
  return this.find({ usage: { $size: 0 } });
};

export default mongoose.model('Image', imageSchema);
