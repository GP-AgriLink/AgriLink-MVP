import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Order from '../models/Order.js';
import DeliveryProfile from '../models/DeliveryProfile.js';
import { validationResult } from 'express-validator';

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

/**
 * @desc    Get all pending farms (waiting for approval)
 * @route   GET /api/admin/farms/pending
 * @access  Private (Admin)
 */
const getPendingFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ status: 'pending' }).populate(
      'user',
      'firstName lastName email phone'
    ); // Show who owns it
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Approve or Reject a farm
 * @route   PUT /api/admin/farms/:id/verify
 * @access  Private (Admin)
 */
const verifyFarm = async (req, res) => {
  const { status, rejectionReason } = req.body; // status should be 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res
      .status(400)
      .json({ message: 'Invalid status. Use approved or rejected.' });
  }

  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    farm.status = status;
    if (status === 'rejected' && rejectionReason) {
      farm.rejectionReason = rejectionReason;
    }

    await farm.save();
    res.json({ message: `Farm ${status} successfully`, farm });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get all pending delivery drivers
 * @route   GET /api/admin/drivers/pending
 * @access  Private (Admin)
 */
const getPendingDrivers = async (req, res) => {
  try {
    const drivers = await DeliveryProfile.find({ status: 'pending' }).populate(
      'user',
      'firstName lastName email phone'
    );
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Approve or Reject a delivery driver
 * @route   PUT /api/admin/drivers/:id/verify
 * @access  Private (Admin)
 */
const verifyDriver = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, rejectionReason } = req.body;

  try {
    const driver = await DeliveryProfile.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // Update Status
    driver.status = status;

    // Handle Rejection Reason
    if (status === 'rejected') {
      driver.rejectionReason = rejectionReason;
    } else {
      driver.rejectionReason = undefined;
    }

    await driver.save();

    res.json({
      message: `Driver ${status} successfully`,
      driver,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  getSystemStats,
  getPendingFarms,
  verifyFarm,
  getPendingDrivers,
  verifyDriver,
};
