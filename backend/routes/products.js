import express from "express";
import Product from "../models/Product.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// GET all products or by category (public)
router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 20, search, active } = req.query;
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 20;
    const skip = (pageInt - 1) * limitInt;

    let query = {};
    if (active !== undefined) {
      query.active = active === 'true';
    }
    if (category) query.category = new RegExp(category, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitInt);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: pageInt,
      limit: limitInt,
      pages: Math.ceil(total / limitInt)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST new product (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: "Failed to add product" });
  }
});

// PUT update product by ID (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

// GET product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Bulk delete products (admin only)
router.delete("/bulk/delete", adminAuth, async (req, res) => {
  try {
    const { productIds } = req.body;
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.json({
      message: `Deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to bulk delete products" });
  }
});

// DELETE product by ID (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET product categories (admin only)
router.get("/admin/categories", adminAuth, async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
