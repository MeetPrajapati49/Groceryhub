import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// GET admin stats
router.get("/stats", adminAuth, async (req, res) => {
  try {
    // Use MongoDB aggregation for efficient counting
    const [productStats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStockCount: {
            $sum: { $cond: [{ $lt: ["$stock", 10] }, 1, 0] }
          }
        }
      }
    ]);

    const [orderStats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $ne: ["$status", "Cancelled"] },
                "$totalAmount",
                0
              ]
            }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();

    // Recent orders (last 5) - limit to prevent memory issues
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userId totalAmount status createdAt');

    // Low stock products - limit to 5
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock category')
      .limit(5);

    // Monthly sales data for charts - limit to last 12 months
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Top selling products - limit to 5
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalProducts: productStats?.totalProducts || 0,
      totalOrders: orderStats?.totalOrders || 0,
      totalUsers,
      totalRevenue: orderStats?.totalRevenue || 0,
      recentOrders,
      lowStockProducts,
      monthlySales,
      topProducts,
      liveUsers: totalUsers, // For now, showing total users as live users
      liveProducts: productStats?.totalProducts || 0 // For now, showing total products as live products
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET sales report (by month or category)
router.get("/sales-report", adminAuth, async (req, res) => {
  try {
    const { timeframe = 'month', category } = req.query;
    let match = { status: { $ne: 'Cancelled' } };
    if (category) {
      match.items = { $elemMatch: { category: new RegExp(category, 'i') } };
    }

    const salesReport = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            category: timeframe === 'category' ? "$items.category" : null
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.json(salesReport);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
});

export default router;
