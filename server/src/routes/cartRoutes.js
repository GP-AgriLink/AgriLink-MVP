import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';

const router = express.Router();

// All cart routes are protected
router.use(protect);

// @route   GET /api/cart
router.get('/', getCart);

// @route   POST /api/cart/item
router.post(
  '/item',
  [
    body('productId', 'Product ID is required').not().isEmpty(),
    body('quantity', 'Quantity must be a number greater than 0')
      .optional()
      .isInt({ min: 1 }),
  ],
  validate,
  addCartItem
);

// @route   DELETE /api/cart/item/:productId
router.delete('/item/:productId', removeCartItem);

// @route   DELETE /api/cart
router.delete('/', clearCart);

export default router;
