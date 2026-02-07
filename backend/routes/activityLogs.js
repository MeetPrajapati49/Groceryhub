import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/logs/activity - Get activity logs with pagination and filtering
router.get('/activity', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      adminId,
      action,
      resourceType,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// POST /api/admin/logs/activity - Create activity log (internal use)
router.post('/activity', adminAuth, async (req, res) => {
  try {
    const {
      action,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      description,
      ipAddress,
      userAgent
    } = req.body;

    const log = new ActivityLog({
      adminId: req.session.userId,
      action,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      description,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent')
    });

    await log.save();
    res.status(201).json({ message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// GET /api/admin/logs/activity/stats - Get activity statistics
router.get('/activity/stats', adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '24h':
        dateFilter.setHours(dateFilter.getHours() - 24);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    const stats = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            action: '$action',
            resourceType: '$resourceType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.action',
          resources: {
            $push: {
              type: '$_id.resourceType',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    // Get recent activities
    const recentActivities = await ActivityLog.find({ createdAt: { $gte: dateFilter } })
      .populate('adminId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action resourceType description createdAt adminId');

    res.json({
      stats,
      recentActivities,
      period
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

export default router;
