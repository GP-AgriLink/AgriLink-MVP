import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getProductsByFarm,
  updateProduct,
  archiveProduct,
  uploadProductImage,
} from "../controllers/productController.js";
import { upload, convertToBase64 } from "../config/upload.js";

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Farmer only)
router.post(
  "/",
  protect, // Use our auth middleware
  [
    // Add validation
    body("name", "Name is required").not().isEmpty(),
    body("price", "Price must be a number").isNumeric(),
    body("unit", "Unit is required").not().isEmpty(),
    body("stock", "Stock count must be a non-negative number").isNumeric({
      min: 0,
    }),
  ],
  createProduct
);

// @route   GET /api/products/myproducts
// @desc    Get all products for the logged-in farmer
// @access  Private
router.get("/myproducts", protect, getMyProducts);

// @route   GET /api/products/farm/:farmId
// @desc    Get all active products for a specific farm
// @access  Public
router.get("/farm/:farmId", getProductsByFarm);

// @route   POST /api/products/:id/upload-image
// @desc    Upload an image for a product
// @access  Private
router.post(
  "/:id/upload-image",
  protect,
  upload.single("productImage"),
  convertToBase64,
  uploadProductImage
);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put("/:id", protect, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete("/:id", protect, archiveProduct);

export default router;