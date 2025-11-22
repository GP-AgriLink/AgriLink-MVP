import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import {
  getSystemStats,
  getPendingFarms,
  verifyFarm,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected and require the 'admin' role
router.use(protect, isAdmin);

// @route   GET /api/admin/stats
router.get('/stats', getSystemStats);

// --- Farm Verification Routes ---
router.get('/farms/pending', getPendingFarms);
router.put('/farms/:id/verify', verifyFarm);

export default router;
