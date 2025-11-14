import express from 'express';
import {
    getMyFarmProfile,
    updateMyFarmProfile,
    getAllFarms,
    getFarmById,
    getNearbyFarms,
    getFarmStats
} from '../controllers/farmController.js';
import { protect, isFarmer } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Farmer Private Routes ---

// @route   GET /api/farms/myfarm/stats
// @desc    Get dashboard stats for the logged-in farmer
// @access  Private (Farmer only)
router.get('/myfarm/stats', protect, isFarmer, getFarmStats);

// @route   GET /api/farms/myfarm
// @desc    Get the logged-in farmer's own farm profile
// @access  Private (Farmer only)
router.get('/myfarm', protect, isFarmer, getMyFarmProfile);

// @route   PUT /api/farms/myfarm
// @desc    Create or update the logged-in farmer's farm profile
// @access  Private (Farmer only)
router.put('/myfarm', protect, isFarmer, updateMyFarmProfile);


// --- Public Routes ---

// @route   GET /api/farms/nearby
// @desc    Get farms within a certain radius
// @access  Public
router.get('/nearby', getNearbyFarms);

// @route   GET /api/farms
// @desc    Get all farms for the homepage map
// @access  Public
router.get('/', getAllFarms);

// @route   GET /api/farms/:id
// @desc    Get the public profile of a single farm
// @access  Public
router.get('/:id', getFarmById);

export default router;