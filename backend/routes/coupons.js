import express from 'express';
import Coupon from '../models/Coupon.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all coupons (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, active = true } = req.query;
    const skip = (page - 1) * limit;

    const query = active === 'true' ? { active: true } : {};

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.json({
      coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// GET coupon by ID (admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupon' });
  }
});

// POST create coupon (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user.id // Assuming adminAuth middleware sets req.user
    };
    const coupon = new Coupon(couponData);
    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create coupon' });
  }
});

// PUT update coupon (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update coupon' });
  }
});

// DELETE coupon (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// POST validate coupon (public)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal, customerId } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }

    if (coupon.minimumOrder && orderTotal < coupon.minimumOrder) {
      return res.status(400).json({
        error: `Minimum order amount is ₹${coupon.minimumOrder}`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'percentage') {
      discount = (orderTotal * coupon.value) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    }

    res.json({
      coupon: {
        id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        description: coupon.description
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

export default router;
