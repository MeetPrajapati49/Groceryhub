import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    
    // Normalize email to lowercase
    const email = req.body.email.toLowerCase();
    const { name, phone, address, password } = req.body;

    // Check if user exists (case insensitive)
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Registration failed - user exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with normalized email
    const user = new User({ 
      name, 
      email, 
      phone, 
      address, 
      password: hashedPassword 
    });

    await user.save();
    console.log('User created:', { _id: user._id, email: user.email });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Registration failed',
      error: err.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Raw login request:', req.body); // Debug log
    
    const email = req.body.email?.toLowerCase()?.trim(); // Double normalization
    const { password } = req.body;

    console.log('Searching for user with email:', email); // Debug log
    
    const user = await User.findOne({ email });
    console.log('Found user:', user); // Debug log

    if (!user) {
      console.log('No user found with email:', email); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;