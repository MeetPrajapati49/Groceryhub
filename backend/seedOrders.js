import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';

async function seedOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/groceryhub');
    console.log('Connected to DB');

    // Get existing users and products
    const users = await User.find().limit(5);
    const products = await Product.find().limit(10);

    if (users.length === 0 || products.length === 0) {
      console.log('No users or products found. Please seed users and products first.');
      return;
    }

    // Sample orders data
    const sampleOrders = [
      {
        userId: users[0]._id,
        items: [
          {
            productId: products[0]._id,
            name: products[0].name,
            price: products[0].price,
            quantity: 2,
            category: products[0].category
          },
          {
            productId: products[1]._id,
            name: products[1].name,
            price: products[1].price,
            quantity: 1,
            category: products[1].category
          }
        ],
        totalAmount: (products[0].price * 2) + (products[1].price * 1),
        status: 'Delivered',
        paymentMethod: 'Card',
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        }
      },
      {
        userId: users[1]._id,
        items: [
          {
            productId: products[2]._id,
            name: products[2].name,
            price: products[2].price,
            quantity: 3,
            category: products[2].category
          }
        ],
        totalAmount: products[2].price * 3,
        status: 'Shipped',
        paymentMethod: 'UPI',
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001'
        }
      },
      {
        userId: users[2]._id,
        items: [
          {
            productId: products[3]._id,
            name: products[3].name,
            price: products[3].price,
            quantity: 1,
            category: products[3].category
          },
          {
            productId: products[4]._id,
            name: products[4].name,
            price: products[4].price,
            quantity: 2,
            category: products[4].category
          }
        ],
        totalAmount: (products[3].price * 1) + (products[4].price * 2),
        status: 'Processing',
        paymentMethod: 'Cash on Delivery',
        shippingAddress: {
          street: '789 Pine Rd',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001'
        }
      },
      {
        userId: users[3]._id,
        items: [
          {
            productId: products[5]._id,
            name: products[5].name,
            price: products[5].price,
            quantity: 4,
            category: products[5].category
          }
        ],
        totalAmount: products[5].price * 4,
        status: 'Pending',
        paymentMethod: 'Card',
        shippingAddress: {
          street: '321 Elm St',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001'
        }
      },
      {
        userId: users[4]._id,
        items: [
          {
            productId: products[6]._id,
            name: products[6].name,
            price: products[6].price,
            quantity: 1,
            category: products[6].category
          },
          {
            productId: products[7]._id,
            name: products[7].name,
            price: products[7].price,
            quantity: 1,
            category: products[7].category
          },
          {
            productId: products[8]._id,
            name: products[8].name,
            price: products[8].price,
            quantity: 1,
            category: products[8].category
          }
        ],
        totalAmount: products[6].price + products[7].price + products[8].price,
        status: 'Delivered',
        paymentMethod: 'UPI',
        shippingAddress: {
          street: '654 Maple Dr',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001'
        }
      }
    ];

    // Insert sample orders
    await Order.insertMany(sampleOrders);
    console.log('Sample orders seeded successfully!');

    // Verify the counts
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`Final counts - Products: ${productCount}, Orders: ${orderCount}, Users: ${userCount}`);

  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

seedOrders();
