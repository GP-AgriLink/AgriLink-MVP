import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Farm from '../models/Farm.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

/**
 * @desc    Create new order(s) from the user's cart
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  // START A MONGOOSE SESSION (for the transaction)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    // Get the user's cart (MUST use the session)
    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    const farmGroups = new Map();
    const productsToUpdate = [];

    // --- CRITICAL: RE-VALIDATE CART LOOP ---
    // This loop checks for stale prices, integrity, and stock.
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);

      // Check 1: Product Integrity
      if (!product || product.isArchived || product.status === 'inactive') {
        throw new AppError(
          `Product "${item.name}" is no longer available. Please remove it from your cart.`,
          400
        );
      }
      // Check 2: Stale Price
      if (product.price !== item.price) {
        throw new AppError(
          `The price of "${item.name}" has changed. Please review your cart.`,
          400
        );
      }
      // Check 3: Stock (Race Condition check)
      if (product.stock < item.quantity) {
        throw new AppError(
          `Not enough stock for "${item.name}". Only ${product.stock} left.`,
          400
        );
      }

      // Group items by farm
      const farmId = item.farm.toString();
      if (!farmGroups.has(farmId)) {
        farmGroups.set(farmId, []);
      }
      farmGroups.get(farmId).push(item);

      // Add product to our update list
      productsToUpdate.push({
        _id: product._id,
        stock: product.stock - item.quantity,
      });
    }

    //  --- CREATE ORDERS LOOP ---
    const createdOrders = [];
    for (const [farmId, items] of farmGroups.entries()) {
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const orderItems = items.map((i) => ({
        productId: i.product,
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

      // We must save the new order using the session
      const savedOrder = await newOrder.save({ session });
      createdOrders.push(savedOrder);
    }

    // --- UPDATE STOCK (ATOMICALLY) ---
    // This is safer than looping and saving one-by-one
    const bulkOps = productsToUpdate.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { stock: p.stock } },
      },
    }));
    await Product.bulkWrite(bulkOps, { session });

    // Clear the user's cart
    cart.items = [];
    await cart.save({ session });

    // --- COMMIT THE TRANSACTION ---
    // If all operations succeeded, commit the changes to the database.
    await session.commitTransaction();

    res.status(201).json(createdOrders);
  } catch (error) {
    // --- ABORT THE TRANSACTION ---
    // If any error occurred, roll back all changes.
    await session.abortTransaction();

    console.error(error.message);

    // Check if it's our operational error
    if (error.isOperational) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // If it's not, it's an unknown server error
    res.status(500).send('Server Error: Order failed');
  } finally {
    // Always end the session
    session.endSession();
  }
};

// /**
//  * @desc    Get all orders for the logged-in user (Customer OR Farmer) (paginated)
//  * @route   GET /api/orders/myorders
//  * @access  Private
//  */
// const getMyOrders = async (req, res) => {
//   try {
//     const limit = Number(req.query.limit) || 10;
//     const page = Number(req.query.page) || 1;
//     const skip = (page - 1) * limit;

//     let query = {};

//     if (req.user.role === "customer") {
//       query = { user: req.user._id };
//     } else if (req.user.role === "farmer") {
//       const farm = await Farm.findOne({ user: req.user._id });
//       if (!farm) {
//         return res.status(404).json({ message: "Farm profile not found." });
//       }
//       query = { farm: farm._id };
//     }

//     // Check for a status in the query string
//     if (req.query.status) {
//       query.status = req.query.status;
//     }

//     const total = await Order.countDocuments(query);
//     const orders = await Order.find(query)
//       .sort({ createdAt: -1 }) // Keep the sort
//       .skip(skip)
//       .limit(limit)
//       .populate("user", "firstName lastName phone");

//     res.json({
//       data: orders,
//       page,
//       pages: Math.ceil(total / limit),
//       total,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// };

/**
 * @desc    Get orders (Dynamic: specific to Customer or Farmer view)
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let query = {};
    let populateConfig = '';

    // --- SCENARIO 1: CUSTOMER ---
    if (req.user.role === 'customer') {
      query.user = req.user._id;

      // Customer View: Show Farm details (including user's avatar as fallback)
      populateConfig = {
        path: 'farm',
        select: 'farmName avatarUrl location user',
        populate: {
          path: 'user',
          select: 'avatarUrl'
        }
      };

      // Search: "Customer searching for a specific Farm"
      if (req.query.search) {
        const matchingFarms = await Farm.find({
          $text: { $search: req.query.search }
        }).select('_id');

        const farmIds = matchingFarms.map((farm) => farm._id);
        query.farm = { $in: farmIds };
      }
    }

    // --- SCENARIO 2: FARMER ---
    else if (req.user.role === 'farmer') {
      const farm = await Farm.findOne({ user: req.user._id });
      if (!farm) {
        return res.status(404).json({ message: 'Farm profile not found.' });
      }
      query.farm = farm._id;

      // Farmer View: Show Customer details
      populateConfig = {
        path: 'user',
        select: 'firstName lastName phone email',
      };

      // Search: "Farmer searching for a Customer (Name, Phone, Email)"
      if (req.query.search) {
        // 1. Find users using Text Index
        const matchingUsers = await User.find({
          $text: { $search: req.query.search }
        }).select('_id');

        // 2. Extract IDs
        const userIds = matchingUsers.map((user) => user._id);

        // 3. Filter orders made by these users
        query.user = { $in: userIds };
      }
    }

    // --- COMMON FILTERS ---
    if (req.query.status) {
      query.status = req.query.status;
    }

    // --- EXECUTE QUERY ---
    // Indexes on Order (farm+status+createdAt or user+createdAt) will automatically optimize this
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate(populateConfig)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is properly linked to a farm
    if (!order.farm) {
      return res
        .status(500)
        .json({ message: 'Order is not linked to a farm (Data Error)' });
    }

    // Find the farm profile for the logged-in farmer
    const farm = await Farm.findOne({ user: req.user._id });

    // Check if the farmer has a farm profile
    if (!farm) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    // --- CRITICAL: Ownership Check ---
    // Compare the order's 'farm' field with the logged-in farmer's farm ID
    if (order.farm.toString() !== farm._id.toString()) {
      return res
        .status(401)
        .json({ message: 'Not authorized to update this order' });
    }

    // --- State Machine Logic ---
    const currentStatus = order.status;

    // Check for final states
    if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
      return res.status(400).json({
        message: `Order is already ${currentStatus} and cannot be changed.`,
      });
    }

    // Check for invalid reverse logic
    if (currentStatus === 'Ready for Delivery' && newStatus === 'Incoming') {
      return res.status(400).json({
        message:
          'Order is already "Ready for Delivery" and cannot be moved back to "Incoming".',
      });
    }

    // Check for valid new status
    const validStatuses = [
      'Incoming',
      'Ready for Delivery',
      'Completed',
      'Cancelled',
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
    res.status(500).send('Server Error');
  }
};

export { createOrder, getMyOrders, updateOrderStatus };
