import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { protect, isFarmer } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order(s) from the user's cart
// @access  Private (Customer only)
router.post(
  '/',
  protect,
  // Note: In our V2 refactor, we removed most body validation because
  // logic relies on the database cart, but if you kept any rules (like deliveryMethod),
  // the validate middleware belongs here.
  [
    // Example: If you are validating deliveryMethod
    // body('deliveryMethod').isIn(['Pickup', 'Delivery'])
  ],
  validate,
  createOrder
);

// @route   GET /api/orders/myorders
// @desc    Get all orders for the logged-in user (Customer or Farmer)
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update the status of an order
// @access  Private (Farmer only)
router.put('/:id/status', protect, isFarmer, updateOrderStatus);

export default router;
