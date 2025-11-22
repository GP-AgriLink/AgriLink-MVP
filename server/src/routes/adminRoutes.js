import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import {
  getSystemStats,
  getPendingFarms,
  verifyFarm,
  getPendingDrivers,
  verifyDriver,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected and require the 'admin' role
router.use(protect, isAdmin);

// @route   GET /api/admin/stats
router.get('/stats', getSystemStats);

// --- Farm Verification Routes ---
router.get('/farms/pending', getPendingFarms);
router.put('/farms/:id/verify', verifyFarm);

// --- Driver Verification Routes ---
router.get('/drivers/pending', getPendingDrivers);

router.put(
  '/drivers/:id/verify',
  [
    body('status', 'Status is required').not().isEmpty(),
    body('status', 'Status must be approved or rejected').isIn([
      'approved',
      'rejected',
    ]),
    // Conditional check: rejectionReason is required if status is rejected
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .not()
      .isEmpty()
      .withMessage('Rejection reason is required'),
  ],
  verifyDriver
);

export default router;
