import { validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 'farmId' comes from the body, 'user' comes from the token
  const { farmId, orderItems } = req.body;
  const userId = req.user._id;

  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // --- Calculate totalAmount ---
    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const newOrder = new Order({
      farm: farmId, // This is the Farm's ID
      user: userId, // This is the Customer's ID
      orderItems,
      totalAmount,
    });

    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get all orders for the logged-in user (Customer OR Farmer) (paginated)
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

        let query = {};

        if (req.user.role === 'customer') {
            query = { user: req.user._id };
        } else if (req.user.role === 'farmer') {
            const farm = await Farm.findOne({ user: req.user._id });
            if (!farm) {
                return res.status(404).json({ message: 'Farm profile not found.' });
            }
            query = { farm: farm._id };
        }

        // Check for a status in the query string
        if (req.query.status) {
            query.status = req.query.status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Keep the sort
            .skip(skip)
            .limit(limit)
            .populate('user', 'firstName lastName phone');

        res.json({
            data: orders,
            page,
            pages: Math.ceil(total / limit),
            total,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Update the status of an order
 * @route   PUT /api/orders/:id/status
 * @access  Private (Farmer only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const newStatus = req.body.status;

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is properly linked to a farm
    if (!order.farm) {
      return res.status(500).json({ message: "Order is not linked to a farm (Data Error)" });
    }

    // Find the farm profile for the logged-in farmer
    const farm = await Farm.findOne({ user: req.user._id });

    // Check if the farmer has a farm profile
    if (!farm) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    // --- CRITICAL: Ownership Check ---
    // Compare the order's 'farm' field with the logged-in farmer's farm ID
    if (order.farm.toString() !== farm._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this order" });
    }

    // --- State Machine Logic ---
    const currentStatus = order.status;

    // Check for final states
    if (currentStatus === "Completed" || currentStatus === "Cancelled") {
      return res.status(400).json({
        message: `Order is already ${currentStatus} and cannot be changed.`,
      });
    }

    // Check for invalid reverse logic
    if (currentStatus === "Ready for Delivery" && newStatus === "Incoming") {
      return res.status(400).json({
        message:
          'Order is already "Ready for Delivery" and cannot be moved back to "Incoming".',
      });
    }

    // Check for valid new status
    const validStatuses = [
      "Incoming",
      "Ready for Delivery",
      "Completed",
      "Cancelled",
    ];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({ message: `"${newStatus}" is not a valid or provided status.` });
    }

    // All checks passed, update the status.
    order.status = newStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export { createOrder, getMyOrders, updateOrderStatus };
