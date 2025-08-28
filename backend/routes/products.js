import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const items = await Product.find().limit(100);
  res.json(items);
});

// quick seed 
router.post('/seed', async (_req, res) => {
  const count = await Product.countDocuments();
  if (count > 0) return res.json({ ok: true, note: 'already seeded' });
  await Product.insertMany([
    { name: 'Organic Tomatoes', image: 'https://images.pexels.com/photos/5377365/pexels-photo-5377365.jpeg', price: 45 },
    { name: 'Fresh Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', price: 35 },
    { name: 'Premium Apples', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', price: 85 },
    { name: 'Organic Milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', price: 48 },
  ]);
  res.json({ ok: true });
});

export default router;
