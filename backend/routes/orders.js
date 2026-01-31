import express from "express";
import Order from "../models/Order.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

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
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: "Failed to update order status" });
  }
});

// GET user's orders (authenticated users)
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId })
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
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    if (!items || !totalAmount || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await Order.create({
      userId: req.session.userId,
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
      userId: req.session.userId
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
