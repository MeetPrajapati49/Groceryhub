import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// get cart
router.get('/', authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  res.json(cart || { items: [] });
});

// add item
router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'product not found' });

  const cart = await getOrCreateCart(req.user.id);
  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx > -1) {
    cart.items[idx].quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity) });
  }
  await cart.save();
  const populated = await cart.populate('items.product');
  res.json(populated);
});

// update qty
router.put('/item/:productId', authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await getOrCreateCart(req.user.id);
  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx === -1) return res.status(404).json({ error: 'not in cart' });

  cart.items[idx].quantity = Math.max(1, Number(quantity || 1));
  await cart.save();
  const populated = await cart.populate('items.product');
  res.json(populated);
});

// remove
router.delete('/item/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user.id);
  cart.items = cart.items.filter(i => i.product.toString() !== productId);
  await cart.save();
  const populated = await cart.populate('items.product');
  res.json(populated);
});

// clear
router.delete('/clear', authMiddleware, async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  cart.items = [];
  await cart.save();
  res.json(cart);
});

export default router;
