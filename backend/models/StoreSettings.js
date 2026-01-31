import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  storeName: { type: String, required: true, default: 'GroceryHub' },
  storeDescription: { type: String, default: '' },
  storeEmail: { type: String, required: true },
  storePhone: { type: String, default: '' },
  storeAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' },

  // Payment Settings
  paymentMethods: {
    stripe: {
      enabled: { type: Boolean, default: false },
      publicKey: { type: String, default: '' },
      secretKey: { type: String, default: '' },
      webhookSecret: { type: String, default: '' }
    },
    paypal: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' }
    },
    cod: {
      enabled: { type: Boolean, default: true },
      description: { type: String, default: 'Cash on Delivery' }
    }
  },

  // Shipping Settings
  shippingMethods: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    cost: { type: Number, required: true, min: 0 },
    freeShippingThreshold: { type: Number, default: null },
    estimatedDays: { type: String, default: '' },
    enabled: { type: Boolean, default: true }
  }],

  // Tax Settings
  taxSettings: {
    enabled: { type: Boolean, default: false },
    defaultRate: { type: Number, default: 0, min: 0, max: 100 },
    taxIncluded: { type: Boolean, default: false }, // true if tax is included in price
    taxRules: [{
      name: { type: String, required: true },
      rate: { type: Number, required: true, min: 0, max: 100 },
      appliesTo: [{ type: String, enum: ['all', 'category', 'product'] }],
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }]
  },

  // Email Settings
  emailSettings: {
    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      auth: {
        user: { type: String, default: '' },
        pass: { type: String, default: '' }
      }
    },
    fromEmail: { type: String, default: '' },
    fromName: { type: String, default: '' }
  },

  // Social Media & External Links
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },

  // Store Policies
  policies: {
    privacyPolicy: { type: String, default: '' },
    termsOfService: { type: String, default: '' },
    refundPolicy: { type: String, default: '' },
    shippingPolicy: { type: String, default: '' }
  },

  // API Keys & Webhooks
  apiKeys: [{
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    permissions: [{ type: String, enum: ['read', 'write', 'admin'] }],
    expiresAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUsed: { type: Date },
    enabled: { type: Boolean, default: true }
  }],

  webhooks: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: [{ type: String, enum: ['order.created', 'order.updated', 'order.cancelled', 'product.created', 'product.updated', 'user.created'] }],
    secret: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Store Status
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'Store is currently under maintenance. Please check back later.' },

  // Analytics & Tracking
  analytics: {
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    enableTracking: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Ensure only one settings document exists
storeSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('StoreSettings').countDocuments();
    if (count > 0) {
      const error = new Error('Only one store settings document is allowed');
      return next(error);
    }
  }
  next();
});

export default mongoose.model('StoreSettings', storeSettingsSchema);
