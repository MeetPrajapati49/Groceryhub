import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';

dotenv.config();

async function seedData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/groceryhub';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@groceryhub.com',
      passwordHash,
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created');

    // Create categories
    const categories = [
      { name: 'Fruits', slug: 'fruits', description: 'Fresh fruits' },
      { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables' },
      { name: 'Dairy', slug: 'dairy', description: 'Milk and dairy products' },
      { name: 'Bakery', slug: 'bakery', description: 'Bread and bakery items' },
      { name: 'Meat', slug: 'meat', description: 'Fresh meat products' }
    ];
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created');

    // Create sample users
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const userPasswordHash = await bcrypt.hash('password123', 10);
      users.push({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        passwordHash: userPasswordHash,
        role: 'customer'
      });
    }
    const createdUsers = await User.insertMany(users);
    console.log('Sample users created');

    // Create products with reliable image URLs
    const products = [
      { name: 'Organic Tomatoes', price: 120, stock: 50, category: 'Vegetables', description: 'Fresh organic tomatoes', images: ['https://images.pexels.com/photos/1367242/pexels-photo-1367242.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Fresh Milk', price: 60, stock: 30, category: 'Dairy', description: 'Fresh cow milk', images: ['https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Whole Wheat Bread', price: 45, stock: 25, category: 'Bakery', description: 'Healthy whole wheat bread', images: ['https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Bananas', price: 80, stock: 40, category: 'Fruits', description: 'Fresh bananas', images: ['https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Chicken Breast', price: 250, stock: 15, category: 'Meat', description: 'Fresh chicken breast', images: ['https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Spinach', price: 30, stock: 35, category: 'Vegetables', description: 'Fresh spinach leaves', images: ['https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Cheddar Cheese', price: 180, stock: 20, category: 'Dairy', description: 'Aged cheddar cheese', images: ['https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Croissants', price: 90, stock: 12, category: 'Bakery', description: 'Buttery croissants', images: ['https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Apples', price: 100, stock: 45, category: 'Fruits', description: 'Red delicious apples', images: ['https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Ground Beef', price: 300, stock: 10, category: 'Meat', description: 'Lean ground beef', images: ['https://images.pexels.com/photos/128401/pexels-photo-128401.jpeg?auto=compress&cs=tinysrgb&w=400'] },
      { name: 'Honey', price: 150, stock: 25, category: 'Bakery', description: 'Pure natural honey', images: ['https://images.pexels.com/photos/1872902/pexels-photo-1872902.jpeg?auto=compress&cs=tinysrgb&w=400'] }
    ];
    const createdProducts = await Product.insertMany(products);
    console.log('Products created');

    // Create sample orders
    const sampleOrders = [];
    for (let i = 0; i < 15; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];

      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          category: product.category
        });
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      sampleOrders.push({
        userId: user._id,
        items,
        totalAmount,
        status,
        paymentMethod: 'Card',
        shippingAddress: {
          street: `${Math.floor(Math.random() * 1000) + 1} Main St`,
          city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][Math.floor(Math.random() * 5)],
          state: 'Maharashtra',
          zipCode: '400001'
        }
      });
    }
    await Order.insertMany(sampleOrders);
    console.log('Sample orders created');

    // Get final counts
    const finalCounts = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      categories: await Category.countDocuments(),
      orders: await Order.countDocuments()
    };

    console.log('Seeding completed successfully!');
    console.log('Final counts:', finalCounts);
    console.log('Admin login: admin@groceryhub.com / admin123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

seedData();
