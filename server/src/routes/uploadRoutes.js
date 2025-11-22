import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage });

// @route   POST /api/uploads
// @desc    Upload an image and get its URL
// @access  Private
router.post(
  '/',
  protect, // Only logged-in users can upload
  upload.single('image'), // 'image' is the form field name
  uploadImage
);

export default router;
