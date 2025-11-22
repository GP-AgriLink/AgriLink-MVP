import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { protect, isFarmer } from '../middleware/authMiddleware.js';
import {
  createProduct,
  getMyProducts,
  getProductsByFarm,
  updateProduct,
  archiveProduct,
  getAllCategories,
} from '../controllers/productController.js';

const router = express.Router();

// @route   GET /api/products/categories
router.get('/categories', getAllCategories);

// @route   POST /api/products
router.post(
  '/',
  protect,
  isFarmer,
  [
    body('name', 'Name is required').not().isEmpty(),
    body('price', 'Price must be a number').isNumeric(),
    body('unit', 'Unit is required').not().isEmpty(),
    body('stock', 'Stock count must be a non-negative number').isNumeric({
      min: 0,
    }),
    body('description', 'Description is optional').optional().isString(),
    body('imageUrl', 'Image URL is optional').optional().isURL(),
    body('categories', 'Categories must be an array').optional().isArray(),
  ],
  validate,
  createProduct
);

// @route   GET /api/products/myproducts
router.get('/myproducts', protect, isFarmer, getMyProducts);

// @route   GET /api/products/farm/:farmId
router.get('/farm/:farmId', getProductsByFarm);

// @route   PUT /api/products/:id
router.put(
  '/:id',
  protect,
  isFarmer,
  [
    body('categories', 'Categories must be an array of strings')
      .optional()
      .isArray(),
  ],
  validate,
  updateProduct
);

// @route   DELETE /api/products/:id
router.delete('/:id', protect, isFarmer, archiveProduct);

export default router;
