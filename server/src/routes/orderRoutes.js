import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import {
    createOrder,
    getMyOrders,
    updateOrderStatus,
    getIncomingOrdersCount,
} from "../controllers/orderController.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public
router.post(
    "/",
    [
        // Validation for the incoming order
        body("farmerId", "Farmer ID is required").not().isEmpty(),
        body("customerName", "Customer name is required").not().isEmpty(),
        body("customerPhone", "Customer phone is required").not().isEmpty(),
        body("orderItems", "Order items cannot be empty").isArray({ min: 1 }),
    ],
    createOrder
);

// @route   GET /api/orders/myorders
// @desc    Get all orders for the logged-in farmer
// @access  Private
router.get("/myorders", protect, getMyOrders);

// @route   GET /api/orders/count/incoming
// @desc    Get count of incoming orders for the logged-in farmer
// @access  Private
router.get("/count/incoming", protect, getIncomingOrdersCount);

// @route   PUT /api/orders/:id/status
// @desc    Update the status of an order
// @access  Private
router.put("/:id/status", protect, updateOrderStatus);

export default router;
