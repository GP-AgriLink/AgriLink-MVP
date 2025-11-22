import express from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import {
  getMyFarmProfile,
  updateMyFarmProfile,
  getAllFarms,
  getFarmById,
  getNearbyFarms,
  getFarmStats,
  getPublicStats,
  getFarmReport,
} from '../controllers/farmController.js';
import { protect, isFarmer } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Farmer Private Routes ---

// @route   GET /api/farms/myfarm/report
router.get(
  '/myfarm/report',
  protect,
  isFarmer,
  [
    query('month', 'Month must be between 1 and 12').isInt({ min: 1, max: 12 }),
    query('year', 'Year must be a valid 4-digit year').isInt({
      min: 2000,
      max: 2100,
    }),
  ],
  validate, // Validate Query Params
  getFarmReport
);

// @route   GET /api/farms/myfarm/stats
router.get('/myfarm/stats', protect, isFarmer, getFarmStats);

// @route   GET /api/farms/myfarm
router.get('/myfarm', protect, isFarmer, getMyFarmProfile);

// @route   PUT /api/farms/myfarm
router.put(
  '/myfarm',
  protect,
  isFarmer,
  [
    body('farmName', 'Farm name cannot be empty').optional().not().isEmpty(),
    body('farmBio', 'Bio must be less than 500 characters')
      .optional()
      .isLength({ max: 500 }),
    body('avatarUrl', 'Avatar must be a valid URL').optional().isURL(),
    body('specialties', 'Specialties must be an array of strings')
      .optional()
      .isArray(),
    body(
      'location.coordinates',
      'Location must include valid coordinates [lng, lat]'
    )
      .optional()
      .isArray({ min: 2, max: 2 }),
  ],
  validate,
  updateMyFarmProfile
);

// --- Public Routes ---

// @route   GET /api/farms/stats
router.get('/stats', getPublicStats);

// @route   GET /api/farms/nearby
router.get(
  '/nearby',
  [
    query('longitude', 'Longitude is required').not().isEmpty(),
    query('latitude', 'Latitude is required').not().isEmpty(),
  ],
  validate, // Validate Query Params
  getNearbyFarms
);

// @route   GET /api/farms
router.get('/', getAllFarms);

// @route   GET /api/farms/:id
router.get('/:id', getFarmById);

export default router;
