import express from 'express';
import InventoryLog from '../models/InventoryLog.js';
import Product from '../models/Product.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// GET inventory logs with filtering
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      reason,
      adminId,
      from,
      to
    } = req.query;

    const query = {};
    if (productId) query.productId = productId;
    if (reason) query.reason = reason;
    if (adminId) query.adminId = adminId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const logs = await InventoryLog.find(query)
      .populate('productId', 'name sku')
      .populate('variantId', 'sku')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

// GET low stock alerts
router.get('/low-stock', adminAuth, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const lowStockProducts = await Product.find({
      stock: { $lte: threshold, $gt: 0 }
    })
    .populate('category', 'name')
    .sort({ stock: 1 });

    const outOfStockProducts = await Product.find({ stock: 0 })
      .populate('category', 'name')
      .sort({ name: 1 });

    res.json({
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      threshold
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// POST adjust stock
router.post('/adjust', adminAuth, async (req, res) => {
  try {
    const { productId, variantId, changeQty, reason, reference, notes } = req.body;

    if (!productId || !changeQty || !reason) {
      return res.status(400).json({ error: 'Product ID, change quantity, and reason are required' });
    }

    // Get current stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousStock = product.stock;
    const newStock = previousStock + changeQty;

    // Prevent negative stock unless explicitly allowed
    if (newStock < 0 && reason !== 'adjustment') {
      return res.status(400).json({ error: 'Insufficient stock for this operation' });
    }

    // Update product stock
    product.stock = newStock;
    await product.save();

    // Create inventory log
    const log = new InventoryLog({
      productId,
      variantId,
      changeQty,
      reason,
      reference,
      notes,
      adminId: req.user.id,
      previousStock,
      newStock
    });

    await log.save();

    res.json({
      message: 'Stock adjusted successfully',
      product: {
        id: product._id,
        name: product.name,
        previousStock,
        newStock
      },
      log
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

// GET inventory summary
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });

    const totalValue = await Product.aggregate([
      { $match: { stock: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);

    res.json({
      totalProducts,
      inStock,
      outOfStock,
      lowStock,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

// POST bulk stock update
router.post('/bulk-update', adminAuth, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, newStock, reason, notes }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, newStock, reason = 'adjustment', notes } = update;

        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }

        const previousStock = product.stock;
        const changeQty = newStock - previousStock;

        product.stock = newStock;
        await product.save();

        // Create inventory log
        const log = new InventoryLog({
          productId,
          changeQty,
          reason,
          notes,
          adminId: req.user.id,
          previousStock,
          newStock
        });

        await log.save();

        results.push({
          productId,
          name: product.name,
          previousStock,
          newStock,
          changeQty
        });
      } catch (error) {
        errors.push({ productId: update.productId, error: error.message });
      }
    }

    res.json({
      message: `Updated ${results.length} products successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

export default router;
