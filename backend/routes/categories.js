import express from 'express';
import Category from '../models/Category.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query; // may be 'true', 'false', or undefined
    let query = {};
    if (active === 'true') query.active = true;
    else if (active === 'false') query.active = false;

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST create category (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Category creation error:', error.message, error.errors);
    res.status(400).json({ error: error.message || 'Failed to create category', details: error.errors });
  }
});

// PUT update category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

// DELETE category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// PUT update sort order (admin only)
router.put('/:id/sort', adminAuth, async (req, res) => {
  try {
    const { sortOrder } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { sortOrder },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category sort order' });
  }
});

export default router;
