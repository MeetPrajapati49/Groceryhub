import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import authRoutes from './routes/authroutes.js';
import cartRoutes from './routes/cart.js';
import productRoutes from './routes/products.js';

dotenv.config();
const app = express();

// CORS must allow credentials for cookies to flow
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// SESSION (must be before routes)
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: false,           
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, 
  }
}));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);

// db + start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('Mongo error:', err));
