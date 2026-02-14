import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'manager', 'viewer'], default: 'customer' },
  phone: { type: String, trim: true },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  totalSpent: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  lastLogin: { type: Date },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  permissions: [{
    resource: String, // 'products', 'orders', 'customers', 'analytics'
    actions: [String] // 'read', 'write', 'delete'
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
