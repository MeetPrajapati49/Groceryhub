import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authroutes.js';
import cartRoutes from './routes/cart.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';
import analyticsRoutes from './routes/analytics.js';
import adminUsersRoutes from './routes/adminUsers.js';
import categoryRoutes from './routes/categories.js';
import couponRoutes from './routes/coupons.js';
import inventoryRoutes from './routes/inventory.js';
import bulkRoutes from './routes/bulk.js';
import activityLogRoutes from './routes/activityLogs.js';
import settingsRoutes from './routes/settings.js';
import imageRoutes from './routes/images.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com", "blob:"],
      connectSrc: ["'self'", "https://res.cloudinary.com"]
    }
  }
}));

// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT', message: 'Too many requests, please try again later' }
});

// Strict auth rate limiter: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT', message: 'Too many login attempts, please try again in 15 minutes' }
});

// CORS must allow credentials for cookies to flow
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  // Production URLs - Add your actual Vercel URL here
  'https://groceryhub.vercel.app',
  'https://groceryhub-meetprajapati49.vercel.app',
  'https://groceryhub-baje-git-main-meetprajapati49s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

// Apply global rate limiter to API routes
app.use('/api/', globalLimiter);

// SESSION (must be before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/groceryhub',
    dbName: 'groceryhub'
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Must use "none" for cross-origin cookies (Vercel frontend ↔ Render backend)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Apply strict rate limiter to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/images', imageRoutes);
app.use('/api/admin/logs', activityLogRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/bulk', bulkRoutes);

// Centralized error handler (must be after routes)
app.use(errorHandler);

// db + start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/groceryhub')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('Mongo error:', err));
