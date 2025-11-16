import express from "express";
import { body } from "express-validator";
import { protect, isFarmer } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getProductsByFarm,
  updateProduct,
  archiveProduct,
  getAllCategories
} from "../controllers/productController.js";

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Farmer only)
router.post(
  "/",
  protect,
  isFarmer,
  [
    // Add validation
    body("name", "Name is required").not().isEmpty(),
    body("price", "Price must be a number").isNumeric(),
    body("unit", "Unit is required").not().isEmpty(),
    body("stock", "Stock count must be a non-negative number").isNumeric({
      min: 0,
    }),

    body('imageUrl', 'Image URL is optional').optional().isURL(),
    body('categories', 'Categories must be an array of strings').optional().isArray()
  ],
  createProduct
);



// --- NEW: Add this route at the top ---
// @route   GET /api/products/categories
// @desc    Get all unique product categories
// @access  Public
router.get('/categories', getAllCategories);

// @route   GET /api/products/myproducts
// @desc    Get all products for the logged-in farmer
// @access  Private
router.get("/myproducts", protect, isFarmer, getMyProducts);

// @route   GET /api/products/farm/:farmId
// @desc    Get all active products for a specific farm
// @access  Public
router.get("/farm/:farmId", getProductsByFarm);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put("/:id", protect, isFarmer,[ 
        body('categories', 'Categories must be an array of strings').optional().isArray()
    ], updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete("/:id", protect, isFarmer, archiveProduct);

export default router;
