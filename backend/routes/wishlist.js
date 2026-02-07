import express from 'express';
import Wishlist from '../models/Wishlist.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get wishlist (authenticated user)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId }).populate('products');
    res.json(wishlist || { products: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
  }
});

// Add to wishlist
router.post('/add', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
  }
});

// Remove from wishlist
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== req.params.productId
      );
      await wishlist.save();
    }
    res.json(wishlist || { products: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
});

export default router;

