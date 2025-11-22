import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import {
  getSystemStats,
  getPendingFarms,
  verifyFarm,
  getPendingDrivers,
  verifyDriver,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes below use protect & isAdmin
router.use(protect, isAdmin);

// --- Stats ---
router.get('/stats', getSystemStats);

// --- Farm Verification Routes ---
router.get('/farms/pending', getPendingFarms);

router.put(
  '/farms/:id/verify',
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
  validate,
  verifyFarm
);

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
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .not()
      .isEmpty()
      .withMessage('Rejection reason is required'),
  ],
  validate,
  verifyDriver
);

export default router;
