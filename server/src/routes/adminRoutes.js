import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { getSystemStats } from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected and require the 'admin' role
router.use(protect, isAdmin);

// @route   GET /api/admin/stats
router.get('/stats', getSystemStats);

export default router;
