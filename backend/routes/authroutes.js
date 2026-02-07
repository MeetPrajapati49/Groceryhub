import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

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

    // auto-login with session (backward compat) + JWT
    req.session.userId = user._id.toString();
    const token = generateToken(user._id.toString());
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'register failed', details: e.message });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        res.status(500).json({ error: 'login failed' });
      } else {
        req.session.userId = user._id.toString();
        const token = generateToken(user._id.toString());
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'login failed' });
  }
});

// me
router.get('/me', async (req, res) => {
  if (!req.session?.userId) return res.json(null);
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.json(null);
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid', { path: '/' });
    res.json({ ok: true });
  });
});

export default router;
