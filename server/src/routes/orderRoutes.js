import express from "express";
import { body } from "express-validator";
import { protect, isFarmer } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order(s) from the user's cart
// @access  Private (Customer only)
router.post("/", protect, createOrder);

// @route   GET /api/orders/myorders
// @desc    Get all orders for the logged-in user (Customer or Farmer)
// @access  Private
router.get("/myorders", protect, getMyOrders); // This route is now dual-purpose

// @route   PUT /api/orders/:id/status
// @desc    Update the status of an order
// @access  Private (Farmer only)
router.put("/:id/status", protect, isFarmer, updateOrderStatus); // NOW FARMER ONLY

export default router;
