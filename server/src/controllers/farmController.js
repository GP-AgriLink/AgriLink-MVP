import Farm from '../models/Farm.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * @desc    Get the logged-in farmer's own farm profile
 * @route   GET /api/farms/myfarm
 * @access  Private (Farmer only)
 */
const getMyFarmProfile = async (req, res) => {
  try {
    const farm = await Farm.findOne({ user: req.user._id });

    if (!farm) {
      return res
        .status(404)
        .json({ message: 'Farm profile not found. Please create one.' });
    }

    res.json(farm);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Create or update the logged-in farmer's farm profile
 * @route   PUT /api/farms/myfarm
 * @access  Private (Farmer only)
 */
const updateMyFarmProfile = async (req, res) => {
  const { farmName, farmBio, avatarUrl, specialties, location } = req.body;

  const profileFields = {};
  if (farmName) profileFields.farmName = farmName;
  if (farmBio) profileFields.farmBio = farmBio;
  if (avatarUrl) profileFields.avatarUrl = avatarUrl;
  if (specialties) profileFields.specialties = specialties;

  // Handle Location GeoJSON
  if (location && location.coordinates) {
    profileFields.location = {
      type: 'Point',
      coordinates: location.coordinates,
    };
  }

  try {
    let farm = await Farm.findOne({ user: req.user._id });

    if (farm) {
      // Update existing profile
      farm = await Farm.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      return res.json(farm);
    } else {
      // Fallback if farm doesn't exist (though registration should handle this)
      return res.status(404).json({ message: 'Farm profile not found.' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
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

    // Only show approved farms
    const query = { status: 'approved' };

    const total = await Farm.countDocuments(query);
    const farms = await Farm.find(query)
      .select('farmName specialties location status avatarUrl')
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
    res.status(500).send('Server Error');
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
      'user',
      'firstName lastName'
    );

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    res.json(farm);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get farms within a certain radius (paginated)
 * @route   GET /api/farms/nearby
 * @access  Public
 */
const getNearbyFarms = async (req, res) => {
  // 3. REMOVED: Manual check for longitude/latitude. Middleware handles it.
  const { longitude, latitude, distance } = req.query;
  const maxDistance = distance || 10000;

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const results = await Farm.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { status: 'approved' }, // Only approved farms
        },
      },
      {
        $project: {
          farmName: 1,
          specialties: 1,
          location: 1,
          distance: 1,
          avatarUrl: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          pagination: [{ $count: 'total' }],
        },
      },
    ]);

    const data = results[0].data;
    const total = results[0].pagination[0] ? results[0].pagination[0].total : 0;

    res.json({
      data: data,
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
 * @desc    Get dashboard statistics for the logged-in farmer
 * @route   GET /api/farms/myfarm/stats
 * @access  Private (Farmer only)
 */
const getFarmStats = async (req, res) => {
  try {
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: 'Farm profile not found.' });
    }
    const farmId = farm._id;

    const productStats = await Product.aggregate([
      { $match: { farm: farmId } },
      {
        $group: {
          _id: { status: '$status', isArchived: '$isArchived' },
          count: { $sum: 1 },
        },
      },
    ]);

    const orderStats = await Order.aggregate([
      { $match: { farm: farmId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      products: { active: 0, inactive: 0, archived: 0 },
      orders: {
        Incoming: 0,
        'Ready for Delivery': 0,
        Completed: 0,
        Cancelled: 0,
      },
    };

    productStats.forEach((stat) => {
      if (stat._id.isArchived) {
        stats.products.archived += stat.count;
      } else if (stat._id.status === 'active') {
        stats.products.active += stat.count;
      } else {
        stats.products.inactive += stat.count;
      }
    });

    orderStats.forEach((stat) => {
      if (stats.orders.hasOwnProperty(stat._id)) {
        stats.orders[stat._id] = stat.count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get public-facing platform statistics
 * @route   GET /api/farms/stats
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      farmCount,
      productCount,
      orderCount,
      totalSalesResult,
      customerCount,
      ordersInLast24Hours,
      newProductsThisWeek,
    ] = await Promise.all([
      Farm.countDocuments({ status: 'approved' }),
      Product.countDocuments({ status: 'active', isArchived: false }),
      Order.countDocuments({ status: 'Completed' }),
      Order.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ createdAt: { $gte: last24Hours } }),
      Product.countDocuments({
        status: 'active',
        isArchived: false,
        createdAt: { $gte: oneWeekAgo },
      }),
    ]);

    const totalSales = totalSalesResult[0]?.total || 0;

    res.json({
      farmsRegistered: farmCount,
      productsListed: productCount,
      ordersCompleted: orderCount,
      totalSalesValue: totalSales,
      customersJoined: customerCount,
      ordersInLast24Hours: ordersInLast24Hours,
      newProductsThisWeek: newProductsThisWeek,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a monthly sales and performance report for the logged-in farmer
 * @route   GET /api/farms/myfarm/report
 * @access  Private (Farmer only)
 */
const getFarmReport = async (req, res) => {
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);

  try {
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: 'Farm profile not found.' });
    }
    const farmId = farm._id;

    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [salesData, bestSellingProductsData, topCustomersData] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              farm: farmId,
              status: 'Completed',
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              totalOrdersCompleted: { $sum: 1 },
              averageOrderValue: { $avg: '$totalAmount' },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              farm: farmId,
              status: 'Completed',
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          { $unwind: '$orderItems' },
          {
            $group: {
              _id: '$orderItems.productId',
              name: { $first: '$orderItems.name' },
              totalQuantitySold: { $sum: '$orderItems.quantity' },
            },
          },
          { $sort: { totalQuantitySold: -1 } },
          { $limit: 5 },
        ]),
        Order.aggregate([
          {
            $match: {
              farm: farmId,
              status: 'Completed',
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: '$user',
              totalSpent: { $sum: '$totalAmount' },
              totalOrdersPlaced: { $sum: 1 },
            },
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 3 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'customerDetails',
            },
          },
          { $unwind: '$customerDetails' },
          {
            $project: {
              _id: 0,
              userId: '$_id',
              name: {
                $concat: [
                  '$customerDetails.firstName',
                  ' ',
                  '$customerDetails.lastName',
                ],
              },
              phone: '$customerDetails.phone',
              totalSpent: 1,
              totalOrdersPlaced: 1,
            },
          },
        ]),
      ]);

    const salesResult = salesData[0] || {
      totalRevenue: 0,
      totalOrdersCompleted: 0,
      averageOrderValue: 0,
    };

    const report = {
      reportMonth: `${startDate.toLocaleString('default', {
        month: 'long',
      })} ${year}`,
      salesOverview: {
        totalRevenue: salesResult.totalRevenue,
        totalOrdersCompleted: salesResult.totalOrdersCompleted,
        averageOrderValue: salesResult.averageOrderValue,
      },
      bestSellingProducts: bestSellingProductsData,
      topCustomers: topCustomersData,
    };

    res.json(report);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
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
