import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'email already used' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    // auto-login
    req.session.userId = user._id.toString();
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'register failed' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    req.session.userId = user._id.toString();
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'login failed' });
  }
});

// me
router.get('/me', (req, res) => {
  if (!req.session?.userId) return res.json(null);
  res.json({ id: req.session.userId });
});

// logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

export default router;
