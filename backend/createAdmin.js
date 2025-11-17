import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/groceryhub');

    const adminExists = await User.findOne({ email: 'admin@groceryhub.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@groceryhub.com',
      passwordHash,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@groceryhub.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
