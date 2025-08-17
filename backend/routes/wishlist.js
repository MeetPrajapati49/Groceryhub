import express from 'express';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// Add to wishlist
router.post('/add', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
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

// Get wishlist
router.get('/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate('products');
    res.json(wishlist || { products: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
  }
});

// Remove from wishlist
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== req.params.productId
      );
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
});

export default router;
