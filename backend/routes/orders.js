import express from "express";
import { body, validationResult } from 'express-validator';
import Order from "../models/Order.js";
import { authMiddleware, adminAuth } from "../middleware/auth.js";

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const router = express.Router();

// GET all orders (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, minTotal, maxTotal, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'userId.name': new RegExp(search, 'i') },
        { 'userId.email': new RegExp(search, 'i') }
      ];
      // Allow searching by order ID if it's a valid MongoDB ObjectId
      if (search.length === 24 && /^[0-9a-fA-F]{24}$/.test(search)) {
        query.$or.push({ _id: search });
      }
    }

    // Add total amount range filter
    if (minTotal || maxTotal) {
      query.totalAmount = {};
      if (minTotal) query.totalAmount.$gte = parseFloat(minTotal);
      if (maxTotal) query.totalAmount.$lte = parseFloat(maxTotal);
    }

    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT update order status by ID (admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    // Note is added via the pre-save hook's statusHistory push, but we can also manually add it
    if (note) {
      // We'll add the note after save since pre-save handles the push
    }
    await order.save();

    // Add note to the last history entry if provided
    if (note && order.statusHistory.length > 0) {
      order.statusHistory[order.statusHistory.length - 1].note = note;
      await order.save();
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to update order status" });
  }
});

// GET user's orders (authenticated users)
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      orders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Bulk update order status (admin only)
router.put("/bulk/status", adminAuth, async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { status }
    );

    res.json({
      message: `Updated ${result.modifiedCount} orders`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(400).json({ error: "Failed to bulk update orders" });
  }
});

// GET order by ID (admin only)
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST create new order (authenticated users)
router.post("/", authMiddleware, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('Total amount must be greater than 0'),
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').trim().notEmpty().withMessage('State is required'),
  body('deliveryAddress.pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required')
], validate, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    if (!items || !totalAmount || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await Order.create({
      userId: req.userId,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET order by ID (user's own order)
router.get("/my-orders/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;
