import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Order from '../models/Order.js';

/**
 * @desc    Get comprehensive system stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getSystemStats = async (req, res) => {
  try {
    const [userCount, farmCount, orderCount] = await Promise.all([
      User.countDocuments({}),
      Farm.countDocuments({}),
      Order.countDocuments({}),
    ]);

    res.json({
      message: 'Welcome, Admin.',
      totalUsers: userCount,
      totalFarms: farmCount,
      totalOrders: orderCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getSystemStats };
