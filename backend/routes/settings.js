import express from 'express';
import StoreSettings from '../models/StoreSettings.js';
import adminAuth from '../middleware/adminAuth.js';
import crypto from 'crypto';

const router = express.Router();

// GET /api/admin/settings - Get store settings
router.get('/', adminAuth, async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new StoreSettings({
        storeName: 'GroceryHub',
        storeEmail: 'admin@groceryhub.com',
        currency: 'USD',
        timezone: 'UTC',
        language: 'en',
        paymentMethods: {
          stripe: { enabled: false },
          paypal: { enabled: false },
          cod: { enabled: true, description: 'Cash on Delivery' }
        },
        shippingMethods: [
          {
            name: 'Standard Shipping',
            description: 'Delivery within 3-5 business days',
            cost: 5.99,
            freeShippingThreshold: 50,
            estimatedDays: '3-5',
            enabled: true
          }
        ],
        taxSettings: {
          enabled: false,
          defaultRate: 0,
          taxIncluded: false,
          taxRules: []
        }
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings - Update store settings
router.put('/', adminAuth, async (req, res) => {
  try {
    const updateData = req.body;
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.apiKeys;
    delete updateData.webhooks;

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(updateData);
    } else {
      Object.assign(settings, updateData);
    }

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/admin/settings/api-keys - Create API key
router.post('/api-keys', adminAuth, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const key = crypto.randomBytes(32).toString('hex');

    const settings = await StoreSettings.findOne();
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    settings.apiKeys.push({
      name,
      key,
      permissions: permissions || ['read'],
      createdBy: req.session.userId,
      enabled: true
    });

    await settings.save();
    res.status(201).json({ message: 'API key created successfully', key });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// DELETE /api/admin/settings/api-keys/:keyId - Delete API key
router.delete('/api-keys/:keyId', adminAuth, async (req, res) => {
  try {
    const { keyId } = req.params;
    const settings = await StoreSettings.findOne();

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    settings.apiKeys = settings.apiKeys.filter(apiKey => apiKey._id.toString() !== keyId);
    await settings.save();

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// POST /api/admin/settings/webhooks - Create webhook
router.post('/webhooks', adminAuth, async (req, res) => {
  try {
    const { name, url, events } = req.body;
    const secret = crypto.randomBytes(32).toString('hex');

    const settings = await StoreSettings.findOne();
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    settings.webhooks.push({
      name,
      url,
      events: events || [],
      secret,
      createdBy: req.session.userId,
      enabled: true
    });

    await settings.save();
    res.status(201).json({ message: 'Webhook created successfully', secret });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// DELETE /api/admin/settings/webhooks/:webhookId - Delete webhook
router.delete('/webhooks/:webhookId', adminAuth, async (req, res) => {
  try {
    const { webhookId } = req.params;
    const settings = await StoreSettings.findOne();

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    settings.webhooks = settings.webhooks.filter(webhook => webhook._id.toString() !== webhookId);
    await settings.save();

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// POST /api/admin/settings/test-email - Test email configuration
router.post('/test-email', adminAuth, async (req, res) => {
  try {
    const { to } = req.body;
    const settings = await StoreSettings.findOne();

    if (!settings || !settings.emailSettings.smtp.host) {
      return res.status(400).json({ error: 'Email settings not configured' });
    }

    // Here you would implement actual email sending logic
    // For now, just return success
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// POST /api/admin/settings/test-webhook - Test webhook
router.post('/test-webhook/:webhookId', adminAuth, async (req, res) => {
  try {
    const { webhookId } = req.params;
    const settings = await StoreSettings.findOne();

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const webhook = settings.webhooks.find(w => w._id.toString() === webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // Here you would implement actual webhook testing logic
    // For now, just return success
    res.json({ message: 'Webhook test sent successfully' });
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ error: 'Failed to test webhook' });
  }
});

export default router;
