import Farm from "../models/Farm.js";
import User from "../models/User.js";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

/**
 * @desc    Get the logged-in farmer's own farm profile
 * @route   GET /api/farms/myfarm
 * @access  Private (Farmer only)
 */
const getMyFarmProfile = async (req, res) => {
  try {
    // req.user._id comes from the 'protect' middleware
    const farm = await Farm.findOne({ user: req.user._id });

    if (!farm) {
      return res
        .status(404)
        .json({ message: "Farm profile not found. Please create one." });
    }

    res.json(farm);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Create or update the logged-in farmer's farm profile
 * @route   PUT /api/farms/myfarm
 * @access  Private (Farmer only)
 */
const updateMyFarmProfile = async (req, res) => {
  const { farmName, farmBio, avatarUrl, specialties, location } = req.body;

  // Build the profile fields to update
  const profileFields = {};
  if (farmName) profileFields.farmName = farmName;
  if (farmBio) profileFields.farmBio = farmBio;
  if (avatarUrl) profileFields.avatarUrl = avatarUrl;
  if (specialties) profileFields.specialties = specialties;

  // Build the location object
  if (location && location.coordinates) {
    profileFields.location = {
      type: "Point",
      coordinates: location.coordinates,
    };
  }

  try {
    // Find the farm profile linked to the logged-in user
    let farm = await Farm.findOne({ user: req.user._id });

    if (farm) {
      // --- Update Existing Profile ---
      farm = await Farm.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      return res.json(farm);
    } else {
      // --- This block is a fallback ---
      // Our new registration logic *should* have already created a farm.
      // But this makes the endpoint robust.
      return res.status(404).json({ message: "Farm profile not found." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get all farms for the homepage map (paginated)
 * @route   GET /api/farms
 * @access  Public
 */
const getAllFarms = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {}; // We can add filters here later if needed

    const total = await Farm.countDocuments(query);
    const farms = await Farm.find(query)
      .select("farmName specialties location")
      .skip(skip)
      .limit(limit);

    res.json({
      data: farms,
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
 * @desc    Get the public profile of a single farm by its ID
 * @route   GET /api/farms/:id
 * @access  Public
 */
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id).populate(
      "user",
      "firstName lastName"
    );

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }
    res.json(farm);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get farms within a certain radius (paginated)
 * @route   GET /api/farms/nearby
 * @access  Public
 */
const getNearbyFarms = async (req, res) => {
  const { longitude, latitude, distance } = req.query;
  const maxDistance = distance || 10000; // 10km default

  if (!longitude || !latitude) {
    return res
      .status(400)
      .json({ message: "Please provide longitude and latitude" });
  }

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    // We must use an aggregation pipeline for $geoNear
    const results = await Farm.aggregate([
      {
        // $geoNear MUST be the first stage.
        // It finds documents and sorts them by distance automatically.
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distance", // This adds a 'distance' field to each document
          maxDistance: parseInt(maxDistance),
          spherical: true, // Use spherical geometry (like $nearSphere)
        },
      },
      {
        // Select only the fields we want to return
        $project: {
          farmName: 1,
          specialties: 1,
          location: 1,
          distance: 1, // We can also return the calculated distance
        },
      },
      {
        // $facet allows us to run two pipelines at once:
        // one for the paginated data and one for the total count.
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          pagination: [{ $count: "total" }],
        },
      },
    ]);

    const data = results[0].data;
    // Get the total, or 0 if no results were found
    const total = results[0].pagination[0] ? results[0].pagination[0].total : 0;

    res.json({
      data: data,
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
 * @desc    Get dashboard statistics for the logged-in farmer
 * @route   GET /api/farms/myfarm/stats
 * @access  Private (Farmer only)
 */
const getFarmStats = async (req, res) => {
  try {
    // Find the farmer's farm ID
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: "Farm profile not found." });
    }
    const farmId = farm._id;

    // --- OPTIMIZATION: Run independent queries in Parallel ---
    const [productStats, orderStats] = await Promise.all([
      // Query 1: Product Stats
      Product.aggregate([
        { $match: { farm: farmId } },
        {
          $group: {
            _id: {
              status: "$status",
              isArchived: "$isArchived",
            },
            count: { $sum: 1 },
          },
        },
      ]),
      // Query 2: Order Stats
      Order.aggregate([
        { $match: { farm: farmId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Process the raw stats into a clean object
    const stats = {
      products: { active: 0, inactive: 0, archived: 0 },
      orders: {
        Incoming: 0,
        "Ready for Delivery": 0,
        Completed: 0,
        Cancelled: 0,
      },
    };

    // Process product stats
    productStats.forEach((stat) => {
      if (stat._id.isArchived) {
        stats.products.archived += stat.count;
      } else if (stat._id.status === "active") {
        stats.products.active += stat.count;
      } else {
        stats.products.inactive += stat.count;
      }
    });

    // Process order stats
    orderStats.forEach((stat) => {
      if (stats.orders.hasOwnProperty(stat._id)) {
        stats.orders[stat._id] = stat.count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get public-facing platform statistics
 * @route   GET /api/farms/stats
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  try {
    // --- Date calculations for new stats ---
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // --- Run all queries in parallel for maximum efficiency ---
    const [
      farmCount,
      productCount,
      orderCount,
      totalSalesResult,
      customerCount,
      ordersInLast24Hours,
      newProductsThisWeek,
    ] = await Promise.all([
      // Count all Farms
      Farm.estimatedDocumentCount(),

      // Count all visible Products
      Product.countDocuments({ status: "active", isArchived: false }),

      // Count all completed Orders
      Order.countDocuments({ status: "Completed" }),

      // Sum the totalAmount of all "Completed" orders
      Order.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Count all registered 'customer' users
      User.countDocuments({ role: "customer" }),

      // Count all orders (any status) in the last 24 hours
      Order.countDocuments({ createdAt: { $gte: last24Hours } }),

      // Count new visible products from the last 7 days
      Product.countDocuments({
        status: "active",
        isArchived: false,
        createdAt: { $gte: oneWeekAgo },
      }),
    ]);

    // Helper to safely get the sales total (it returns an array)
    const totalSales = totalSalesResult[0]?.total || 0;

    res.json({
      // --- Static Stats ---
      farmsRegistered: farmCount,
      productsListed: productCount,
      ordersCompleted: orderCount,
      totalSalesValue: totalSales,
      customersJoined: customerCount,

      // --- Activity Stats ---
      ordersInLast24Hours: ordersInLast24Hours,
      newProductsThisWeek: newProductsThisWeek,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get a monthly sales and performance report for the logged-in farmer
 * @route   GET /api/farms/myfarm/report
 * @access  Private (Farmer only)
 */
const getFarmReport = async (req, res) => {
  try {
    // Get Farm ID
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: "Farm profile not found." });
    }
    const farmId = farm._id;

    // Get and validate date range from query params
    const month = parseInt(req.query.month); // 1 (Jan) - 12 (Dec)
    const year = parseInt(req.query.year);

    if (!month || !year || month < 1 || month > 12) {
      return res
        .status(400)
        .json({ message: "Please provide a valid month (1-12) and year." });
    }

    // Calculate start and end dates for the query
    // JS Date months are 0-11, so (month - 1)
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    // Day 0 of the *next* month is the last day of the *current* month
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // --- OPTIMIZATION: Single Pipeline with $facet ---
    // Instead of 3 separate DB calls, we run one initial match and split the results.
    const reportData = await Order.aggregate([
      // 1. Common Filter (Uses Index: { farm: 1, status: 1, createdAt: -1 })
      {
        $match: {
          farm: farmId,
          status: "Completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      // 2. Split into multiple pipelines
      {
        $facet: {
          // Branch A: Sales Overview
          salesOverview: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalOrdersCompleted: { $sum: 1 },
                averageOrderValue: { $avg: "$totalAmount" },
              },
            },
          ],
          // Branch B: Best Selling Products
          bestSellingProducts: [
            { $unwind: "$orderItems" },
            {
              $group: {
                _id: "$orderItems.productId",
                name: { $first: "$orderItems.name" },
                totalQuantitySold: { $sum: "$orderItems.quantity" },
              },
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
          ],
          // Branch C: Top Customers
          topCustomers: [
            {
              $group: {
                _id: "$user",
                totalSpent: { $sum: "$totalAmount" },
                totalOrdersPlaced: { $sum: 1 },
              },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 3 },
            // Lookups inside facet work fine for small datasets (like Top 3)
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "customerDetails",
              },
            },
            { $unwind: "$customerDetails" },
            {
              $project: {
                _id: 0,
                userId: "$_id",
                name: {
                  $concat: [
                    "$customerDetails.firstName",
                    " ",
                    "$customerDetails.lastName",
                  ],
                },
                phone: "$customerDetails.phone",
                totalSpent: 1,
                totalOrdersPlaced: 1,
              },
            },
          ],
        },
      },
    ]);

    // Extract results (Facet returns an array with one object)
    const results = reportData[0];

    const salesResult = results.salesOverview[0] || {
      totalRevenue: 0,
      totalOrdersCompleted: 0,
      averageOrderValue: 0,
    };

    const report = {
      reportMonth: `${startDate.toLocaleString("default", {
        month: "long",
      })} ${year}`,
      // Manually build the object to exclude the _id
      salesOverview: {
        totalRevenue: salesResult.totalRevenue,
        totalOrdersCompleted: salesResult.totalOrdersCompleted,
        averageOrderValue: salesResult.averageOrderValue,
      },
      bestSellingProducts: results.bestSellingProducts,
      topCustomers: results.topCustomers,
    };

    res.json(report);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export {
  getMyFarmProfile,
  updateMyFarmProfile,
  getAllFarms,
  getFarmById,
  getNearbyFarms,
  getFarmStats,
  getPublicStats,
  getFarmReport,
};
