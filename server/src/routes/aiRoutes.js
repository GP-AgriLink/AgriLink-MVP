/**
 * AI Routes
 * Routes for AI-powered content generation
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateDescription,
  standardizeCategoryController,
  generateBio,
  uploadImage,
  deleteFile,
  getImage,
  generateReportAnalysis,
} from '../controllers/aiController.js';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * @route   POST /api/ai/product-description
 * @desc    Generate product description using AI
 * @access  Private
 */
router.post("/product-description", generateDescription);

/**
 * @route   POST /api/ai/standardize-category
 * @desc    Standardize product category using AI
 * @access  Private
 */
router.post("/standardize-category", standardizeCategoryController);

/**
 * @route   POST /api/ai/farm-bio
 * @desc    Generate farm bio using AI
 * @access  Private
 */
router.post("/farm-bio", generateBio);

/**
 * @route   POST /api/ai/upload-image
 * @desc    Upload image to Gemini File API
 * @access  Private
 */
router.post("/upload-image", uploadImage);

/**
 * @route   DELETE /api/ai/files/:fileName
 * @desc    Delete file from Gemini File API
 * @access  Private
 */
router.delete("/files/:fileName", deleteFile);

/**
 * @route   POST /api/ai/img
 * @desc    Get or upload product image with smart caching
 * @access  Private
 */
router.post("/img", getImage);

/**
 * @route   POST /api/ai/farm-report-analysis
 * @desc    Generate AI-powered farm report analysis with predictions and suggestions
 * @access  Private (Farmer only)
 */
router.post("/farm-report-analysis", generateReportAnalysis);

export default router;
