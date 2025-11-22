import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getCustomerReport,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users/register
router.post(
  '/register',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({
      min: 6,
    }),
    body('phone', 'Phone number is required').not().isEmpty(),
    body('role', 'Role is required').isIn(['customer', 'farmer', 'delivery']),
    // Conditional validation: if role is 'farmer', farmName is required
    body('farmName')
      .if(body('role').equals('farmer'))
      .not()
      .isEmpty()
      .withMessage('Farm name is required for farmers'),
  ],
  registerUser
);

// @route   POST /api/users/login
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  loginUser
);

// @route   GET /api/users/profile/report
// @desc    Get an annual spending report for the logged-in user
// @access  Private
router.get('/profile/report', protect, getCustomerReport);

// @route   GET /api/users/profile
// @route   PUT /api/users/profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// --- PASSWORD RESET ROUTES ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
