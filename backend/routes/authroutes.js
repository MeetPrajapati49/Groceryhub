import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const router = express.Router();

// register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res) => {
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
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], validate, async (req, res) => {
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

// forgot password – demo mode (returns code in response, no email needed)
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
], validate, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'No account found with that email' });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Demo mode: return code in response (in production, send via email)
    res.json({ message: 'Reset code generated', code });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ error: 'Failed to generate reset code' });
  }
});

// reset password with code
router.post('/reset-password', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetCode: code,
      resetCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
