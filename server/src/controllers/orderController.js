import { validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";
import Cart from "../models/Cart.js";

/**
 * @desc    Create new order(s) from the user's cart
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the user's cart and populate the products to check stock
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "stock name"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // First Pass: Check stock for ALL items in the cart
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(404).json({
          message: `Product ${item.name} not found. Please remove it from your cart.`,
        });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}`,
        });
      }
    }

    // Group items by farm
    const farmGroups = new Map();
    for (const item of cart.items) {
      const farmId = item.farm.toString();
      if (!farmGroups.has(farmId)) {
        farmGroups.set(farmId, []);
      }
      farmGroups.get(farmId).push(item);
    }

    // Second Pass: Create orders and decrement stock
    const createdOrders = [];
    for (const [farmId, items] of farmGroups.entries()) {
      // Calculate total for this sub-order
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      // Map cart items to order items
      const orderItems = items.map((i) => ({
        productId: i.product._id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
      }));

      // Create the new order
      const newOrder = new Order({
        farm: farmId,
        user: userId,
        orderItems: orderItems,
        totalAmount,
      });

      await newOrder.save();
      createdOrders.push(newOrder);

      // Decrement stock for each item in this sub-order
      for (const item of items) {
        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // Clear the user's cart
    cart.items = [];
    await cart.save();

    // Respond with an array of all newly created orders
    res.status(201).json(createdOrders);
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

    if (req.user.role === "customer") {
      query = { user: req.user._id };
    } else if (req.user.role === "farmer") {
      const farm = await Farm.findOne({ user: req.user._id });
      if (!farm) {
        return res.status(404).json({ message: "Farm profile not found." });
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
      .populate("user", "firstName lastName phone");

    res.json({
      data: orders,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
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
      return res
        .status(500)
        .json({ message: "Order is not linked to a farm (Data Error)" });
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
