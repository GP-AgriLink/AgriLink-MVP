/**
 * AI Controller
 * Handles AI-powered content generation requests
 * @route   /api/ai
 * @access  Private (requires authentication)
 */

import {
  generateProductDescription,
  standardizeCategory,
  generateFarmBio,
  isAIConfigured,
  uploadImageToAI,
  deleteAIFile,
  getOrUploadImage,
  generateFarmReportAnalysis,
} from '../utils/aiService.js';
import Farm from '../models/Farm.js';
import Order from '../models/Order.js';

/**
 * @desc    Generate product description using AI
 * @route   POST /api/ai/product-description
 * @access  Private
 */
export const generateDescription = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please add AI_API_KEY to your environment variables.',
      });
    }

    const { name, imageUrl, existingDescription, productId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    // ALWAYS upload images to File API (even without productId = temporary upload)
    let fileData = null;
    if (imageUrl) {
      try {
        if (productId) {
          // EditProduct: Use smart caching with productId
          fileData = await getOrUploadImage(imageUrl, productId);
        } else {
          // AddProduct: Temporary upload (auto-deletes after 48h)
          fileData = await uploadImageToAI(imageUrl);
        }
      } catch (uploadError) {
        console.warn('[AI Controller] File upload failed:', uploadError);
        return res.status(400).json({ message: 'Failed to upload image' });
      }
    }

    const description = await generateProductDescription(
      name,
      imageUrl,
      existingDescription || '',
      fileData
    );

    res.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate description',
    });
  }
};

/**
 * @desc    Standardize product category using AI
 * @route   POST /api/ai/standardize-category
 * @access  Private
 */
export const standardizeCategoryController = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please add AI_API_KEY to your environment variables.',
      });
    }

    const { name, imageUrl, existingCategory, productId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    // ALWAYS upload images to File API
    let fileData = null;
    if (imageUrl) {
      try {
        if (productId) {
          // EditProduct: Use smart caching
          fileData = await getOrUploadImage(imageUrl, productId);
        } else {
          // AddProduct: Temporary upload
          fileData = await uploadImageToAI(imageUrl);
        }
      } catch (uploadError) {
        console.warn('[AI Controller] File upload failed:', uploadError);
        return res.status(400).json({ message: 'Failed to upload image' });
      }
    }

    const category = await standardizeCategory(
      name,
      imageUrl || '',
      existingCategory || '',
      fileData
    );

    res.json({ category });
  } catch (error) {
    console.error('Error standardizing category:', error);
    res.status(500).json({
      message: error.message || 'Failed to standardize category',
    });
  }
};

/**
 * @desc    Generate farm bio using AI
 * @route   POST /api/ai/farm-bio
 * @access  Private
 */
export const generateBio = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please configure AI_API_KEY in server environment.',
      });
    }

    const { farmName, locationName, specialties, existingBio } = req.body;

    if (!farmName || !farmName.trim()) {
      return res.status(400).json({ message: 'Farm name is required' });
    }

    const bio = await generateFarmBio(
      farmName,
      locationName || null,
      specialties || [],
      existingBio || ''
    );

    res.json({ bio });
  } catch (error) {
    console.error('AI Bio Generation Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate farm bio',
    });
  }
};

/**
 * @desc    Upload image to AI File API
 * @route   POST /api/ai/upload-image
 * @access  Private
 */
export const uploadImage = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please configure AI_API_KEY in server environment.',
      });
    }

    const { imageUrl } = req.body;

    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const fileData = await uploadImageToAI(imageUrl);

    if (!fileData) {
      return res.status(500).json({
        message: 'Failed to upload image to AI File API',
      });
    }

    res.json({ fileData });
  } catch (error) {
    console.error('AI File Upload Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to upload image',
    });
  }
};

/**
 * @desc    Delete file from AI File API
 * @route   DELETE /api/ai/files/:fileName
 * @access  Private
 */
export const deleteFile = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please configure AI_API_KEY in server environment.',
      });
    }

    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({ message: 'File name is required' });
    }

    const success = await deleteAIFile(fileName);

    if (!success) {
      return res.status(500).json({
        message: 'Failed to delete file from AI File API',
      });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('AI File Deletion Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to delete file',
    });
  }
};

/**
 * @desc    Get or upload product image to File API (smart caching)
 * @route   POST /api/ai/img
 * @access  Private
 */
export const getImage = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please configure AI_API_KEY in server environment.',
      });
    }

    const { imageUrl, productId } = req.body;

    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    if (!productId || !productId.trim()) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const fileData = await getOrUploadImage(imageUrl, productId);

    if (!fileData) {
      return res.status(500).json({
        message: 'Failed to get or upload image to AI File API',
      });
    }

    res.json({ fileData });
  } catch (error) {
    console.error('AI Get or Upload Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to get or upload image',
    });
  }
};

/**
 * @desc    Generate AI-powered farm report analysis
 * @route   POST /api/ai/farm-report-analysis
 * @access  Private (Farmer only)
 */
export const generateReportAnalysis = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'AI service is not configured. Please configure AI_API_KEY in server environment.',
      });
    }

    const { month, year, language = 'EN', isDetailed = false } = req.body;

    // Get farmer's farm
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: 'Farm profile not found.' });
    }

    const farmId = farm._id;
    const farmName = farm.farmName || 'Your Farm';

    // Get current month report if month/year provided
    let currentReport = null;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const currentData = await Order.aggregate([
        {
          $match: {
            farm: farmId,
            status: 'Completed',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $facet: {
            salesOverview: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$totalAmount' },
                  totalOrdersCompleted: { $sum: 1 },
                  averageOrderValue: { $avg: '$totalAmount' },
                },
              },
            ],
            bestSellingProducts: [
              { $unwind: '$orderItems' },
              {
                $group: {
                  _id: '$orderItems.productId',
                  name: { $first: '$orderItems.name' },
                  totalQuantitySold: { $sum: '$orderItems.quantity' },
                },
              },
              { $sort: { totalQuantitySold: -1 } },
              { $limit: 5 },
            ],
          },
        },
      ]);

      if (currentData[0]) {
        const salesResult = currentData[0].salesOverview[0] || {
          totalRevenue: 0,
          totalOrdersCompleted: 0,
          averageOrderValue: 0,
        };

        currentReport = {
          totalRevenue: salesResult.totalRevenue,
          totalOrdersCompleted: salesResult.totalOrdersCompleted,
          averageOrderValue: salesResult.averageOrderValue,
          bestSellingProducts: currentData[0].bestSellingProducts,
        };
      }
    }

    // Get historical reports (last 12 months or available)
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    const historicalData = await Order.aggregate([
      {
        $match: {
          farm: farmId,
          status: 'Completed',
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          salesOverview: {
            $push: {
              totalRevenue: { $sum: '$totalAmount' },
              totalOrdersCompleted: { $sum: 1 },
              averageOrderValue: { $avg: '$totalAmount' },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          salesOverview: {
            totalRevenue: { $sum: '$salesOverview.totalRevenue' },
            totalOrdersCompleted: { $size: '$salesOverview' },
            averageOrderValue: { $avg: '$salesOverview.averageOrderValue' },
          },
        },
      },
      { $sort: { year: 1, month: 1 } },
      { $limit: 12 },
    ]);

    // Generate AI analysis
    const analysis = await generateFarmReportAnalysis(
      farmName,
      historicalData,
      currentReport,
      language,
      isDetailed
    );

    res.json(analysis);
  } catch (error) {
    console.error('AI Report Analysis Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate report analysis',
    });
  }
};
