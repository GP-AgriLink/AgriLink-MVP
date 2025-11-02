import { validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { farmerId, customerName, customerPhone, orderItems } = req.body;

    try {
        // --- CRITICAL: Inventory Management ---
        // This loop checks stock and decrements it for each item in the order.
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res
                    .status(404)
                    .json({ message: `Product not found: ${item.name}` });
            }

            // ... stock checking logic ...
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
                });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate totalAmount
        const totalAmount = orderItems.reduce((sum, item) => {
            return sum + item.quantity * item.unitPrice;
        }, 0);

        const newOrder = new Order({
            farmer: farmerId,
            customerName,
            customerPhone,
            orderItems,
            totalAmount,
        });

        // The pre-save hook will automatically calculate the totalAmount
        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};

/**
 * @desc    Get all orders for the logged-in farmer
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
    try {
        // Find all orders for the logged-in farmer and sort them by most recent
        // This query perfectly uses the compound index: { farmer: 1, createdAt: -1 }
        const orders = await Order.find({ farmer: req.farmer._id }).sort({
            createdAt: -1,
        });
        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};

/**
 * @desc    Update the status of an order
 * @route   PUT /api/orders/:id/status
 * @access  Private
 */
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // --- CRITICAL: Ownership Check ---
        if (order.farmer.toString() !== req.farmer._id.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to update this order" });
        }

        // Update the status from the request body
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};

/**
 * @desc    Get the count of incoming orders for the logged-in farmer
 * @route   GET /api/orders/count/incoming
 * @access  Private
 */
const getIncomingOrdersCount = async (req, res) => {
    try {
        // This query perfectly uses the compound index: { farmer: 1, status: 1 }
        const count = await Order.countDocuments({
            farmer: req.farmer._id,
            status: "Incoming",
        });
        res.json({ count });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};

export { createOrder, getMyOrders, updateOrderStatus, getIncomingOrdersCount };
