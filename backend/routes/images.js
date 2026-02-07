import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Image from '../models/Image.js';
import { adminAuth } from '../middleware/auth.js';

// Cloudinary imports - use if CLOUDINARY_CLOUD_NAME is set
let cloudinaryStorage = null;
let cloudinary = null;

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (useCloudinary) {
  try {
    const cloudinaryModule = await import('cloudinary');
    cloudinary = cloudinaryModule.v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured successfully');
  } catch (e) {
    console.log('⚠️ Cloudinary not available, using local storage');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists (for local fallback)
const uploadsDir = path.join(__dirname, '../uploads');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/admin/images/upload - Upload single or multiple images
router.post('/upload', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedImages = [];
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    for (const file of req.files) {
      let imageUrl = '';
      let thumbnails = [];
      let filename = '';

      // Use Cloudinary if available
      if (useCloudinary && cloudinary) {
        try {
          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'groceryhub',
                transformation: [
                  { width: 800, height: 800, crop: 'limit', quality: 'auto' }
                ]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(file.buffer);
          });

          imageUrl = uploadResult.secure_url;
          filename = uploadResult.public_id;

          // Create thumbnail URLs using Cloudinary transformations
          thumbnails = [
            {
              size: 'small',
              url: cloudinary.url(uploadResult.public_id, { width: 150, height: 150, crop: 'fill' }),
              dimensions: { width: 150, height: 150 }
            },
            {
              size: 'medium',
              url: cloudinary.url(uploadResult.public_id, { width: 400, height: 400, crop: 'fill' }),
              dimensions: { width: 400, height: 400 }
            },
            {
              size: 'large',
              url: cloudinary.url(uploadResult.public_id, { width: 800, height: 800, crop: 'limit' }),
              dimensions: { width: 800, height: 800 }
            }
          ];

          console.log(`✅ Uploaded to Cloudinary: ${imageUrl}`);
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed:', cloudinaryError);
          return res.status(500).json({ error: 'Image upload failed - Cloudinary error' });
        }
      } else {
        // Fallback to local storage
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname).toLowerCase();
        filename = `${timestamp}-${random}${extension}`;

        const originalPath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(originalPath, file.buffer);

        imageUrl = `${baseUrl}/uploads/${filename}`;

        thumbnails = [
          { size: 'small', url: imageUrl, dimensions: { width: 150, height: 150 } },
          { size: 'medium', url: imageUrl, dimensions: { width: 400, height: 400 } },
          { size: 'large', url: imageUrl, dimensions: { width: 800, height: 800 } }
        ];
      }

      // Create database record
      const image = new Image({
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: useCloudinary ? imageUrl : `/uploads/${filename}`,
        url: imageUrl,
        dimensions: { width: 800, height: 800 },
        thumbnails,
        uploadedBy: req.session.userId,
        category: req.body.category || 'general',
        alt: req.body.alt || '',
        caption: req.body.caption || '',
        tags: req.body.tags ? JSON.parse(req.body.tags) : []
      });

      await image.save();
      uploadedImages.push(image);
    }

    res.status(201).json({
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});


// GET /api/admin/images - Get images with pagination and filtering
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // Apply filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = { $in: [req.query.tag] };
    if (req.query.search) {
      filter.$or = [
        { originalName: { $regex: req.query.search, $options: 'i' } },
        { alt: { $regex: req.query.search, $options: 'i' } },
        { caption: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const images = await Image.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments(filter);

    res.json({
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// GET /api/admin/images/:id - Get single image
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// PUT /api/admin/images/:id - Update image metadata
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { alt, caption, tags, category } = req.body;

    const image = await Image.findByIdAndUpdate(
      req.params.id,
      {
        alt: alt || '',
        caption: caption || '',
        tags: tags || [],
        category: category || 'general'
      },
      { new: true }
    ).populate('uploadedBy', 'name email');

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image updated successfully', image });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/admin/images/:id - Delete image
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if image is in use
    if (image.usage.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete image that is currently in use',
        usage: image.usage
      });
    }

    // Delete physical files
    try {
      fs.unlinkSync(path.join(uploadsDir, image.filename));
      for (const thumbnail of image.thumbnails) {
        const thumbPath = path.join(__dirname, '../', thumbnail.path);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
    }

    // Delete database record
    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// POST /api/admin/images/bulk-delete - Bulk delete images
router.post('/bulk-delete', adminAuth, async (req, res) => {
  try {
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ error: 'No image IDs provided' });
    }

    const images = await Image.find({ _id: { $in: imageIds } });

    // Check for images in use
    const inUseImages = images.filter(img => img.usage.length > 0);
    if (inUseImages.length > 0) {
      return res.status(400).json({
        error: 'Some images cannot be deleted as they are currently in use',
        inUseImages: inUseImages.map(img => ({ id: img._id, usage: img.usage }))
      });
    }

    // Delete physical files
    for (const image of images) {
      try {
        fs.unlinkSync(path.join(uploadsDir, image.filename));
        for (const thumbnail of image.thumbnails) {
          const thumbPath = path.join(__dirname, '../', thumbnail.path);
          if (fs.existsSync(thumbPath)) {
            fs.unlinkSync(thumbPath);
          }
        }
      } catch (fileError) {
        console.error(`Error deleting files for ${image.filename}:`, fileError);
      }
    }

    // Delete database records
    await Image.deleteMany({ _id: { $in: imageIds } });

    res.json({ message: `${imageIds.length} images deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting images:', error);
    res.status(500).json({ error: 'Failed to delete images' });
  }
});

// GET /api/admin/images/stats - Get image statistics
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const stats = await Image.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalSize: { $sum: '$size' },
          categories: { $addToSet: '$category' },
          unusedImages: {
            $sum: { $cond: [{ $eq: [{ $size: '$usage' }, 0] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Image.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || { totalImages: 0, totalSize: 0, unusedImages: 0 },
      categories: categoryStats
    });
  } catch (error) {
    console.error('Error fetching image stats:', error);
    res.status(500).json({ error: 'Failed to fetch image statistics' });
  }
});

export default router;
