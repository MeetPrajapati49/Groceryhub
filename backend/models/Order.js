import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, required: true },
    image: String
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' }
}, { timestamps: true });

// Auto-track status changes
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{ status: 'Pending', timestamp: new Date() }];
  } else if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

export default mongoose.model('Order', orderSchema);
