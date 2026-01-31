import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// POST /api/bulk/products/import - Import products from CSV
router.post('/products/import', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let rowNumber = 1;

    // Convert buffer to readable stream
    const stream = Readable.from(req.file.buffer);

    // Process CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', async (row) => {
          rowNumber++;
          try {
            // Validate required fields
            if (!row.name || !row.sku || !row.price) {
              errors.push({
                row: rowNumber,
                error: 'Missing required fields: name, sku, price'
              });
              return;
            }

            // Check if product already exists
            const existingProduct = await Product.findOne({ sku: row.sku });
            if (existingProduct) {
              errors.push({
                row: rowNumber,
                error: `Product with SKU ${row.sku} already exists`
              });
              return;
            }

            // Find category if provided
            let categoryId = null;
            if (row.category) {
              const category = await Category.findOne({
                name: { $regex: new RegExp(`^${row.category.trim()}$`, 'i') }
              });
              if (category) {
                categoryId = category._id;
              }
            }

            // Create product
            const product = new Product({
              name: row.name.trim(),
              sku: row.sku.trim(),
              description: row.description ? row.description.trim() : '',
              price: parseFloat(row.price),
              stock: parseInt(row.stock) || 0,
              category: categoryId,
              images: row.images ? row.images.split(',').map(url => url.trim()) : [],
              isActive: row.isActive !== 'false'
            });

            await product.save();
            results.push({
              row: rowNumber,
              product: {
                id: product._id,
                name: product.name,
                sku: product.sku
              }
            });

          } catch (error) {
            errors.push({
              row: rowNumber,
              error: error.message
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    res.json({
      message: `Import completed. ${results.length} products imported successfully.`,
      imported: results.length,
      errors: errors.length,
      results,
      errors: errors.slice(0, 10) // Limit error details
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to process import file' });
  }
});

// GET /api/bulk/products/export - Export products to CSV
router.get('/products/export', adminAuth, async (req, res) => {
  try {
    const { category, stock_status, is_active } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (stock_status === 'in_stock') query.stock = { $gt: 0 };
    if (stock_status === 'out_of_stock') query.stock = 0;
    if (stock_status === 'low_stock') query.stock = { $gt: 0, $lte: 10 };
    if (is_active !== undefined) query.isActive = is_active === 'true';

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ name: 1 });

    // Create CSV content
    const csvHeaders = [
      'Name',
      'SKU',
      'Description',
      'Price',
      'Stock',
      'Category',
      'Images',
      'Is Active'
    ].join(',');

    const csvRows = products.map(product => [
      `"${product.name.replace(/"/g, '""')}"`,
      `"${product.sku}"`,
      `"${(product.description || '').replace(/"/g, '""')}"`,
      product.price,
      product.stock,
      `"${(product.category?.name || '').replace(/"/g, '""')}"`,
      `"${(product.images || []).join('; ')}"`,
      product.isActive ? 'true' : 'false'
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.csv"`);

    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export products' });
  }
});

// POST /api/bulk/products/update - Bulk update products
router.post('/products/update', adminAuth, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, ...updateData } = update;

        if (!id) {
          errors.push({ id, error: 'Product ID is required' });
          continue;
        }

        const product = await Product.findById(id);
        if (!product) {
          errors.push({ id, error: 'Product not found' });
          continue;
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined) {
            product[key] = updateData[key];
          }
        });

        await product.save();

        results.push({
          id: product._id,
          name: product.name,
          updated: Object.keys(updateData)
        });

      } catch (error) {
        errors.push({
          id: update.id,
          error: error.message
        });
      }
    }

    res.json({
      message: `Updated ${results.length} products successfully`,
      updated: results.length,
      errors: errors.length,
      results,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

// GET /api/bulk/template - Download CSV template
router.get('/template', adminAuth, (req, res) => {
  const template = `Name,SKU,Description,Price,Stock,Category,Images,Is Active
"Sample Product 1","SP001","This is a sample product",29.99,100,"Electronics","https://example.com/image1.jpg; https://example.com/image2.jpg",true
"Sample Product 2","SP002","Another sample product",49.99,50,"Clothing","https://example.com/image3.jpg",true`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products_import_template.csv"');
  res.send(template);
});

export default router;
