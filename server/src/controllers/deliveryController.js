import DeliveryProfile from '../models/DeliveryProfile.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Create or Update Delivery Profile
 * @route   POST /api/delivery/profile
 * @access  Private (Delivery Role Only)
 */
const updateDeliveryProfile = async (req, res) => {
  // Check for validation errors first
  // This prevents the crash if req.body is empty
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { vehicleType, licensePlate, nationalId, licenseUrl, nationalIdUrl } =
    req.body;

  try {
    let profile = await DeliveryProfile.findOne({ user: req.user._id });

    const profileFields = {
      user: req.user._id,
      vehicleType,
      licensePlate,
      nationalId,
      documents: {
        licenseUrl,
        nationalIdUrl,
      },
    };

    if (profile) {
      profile = await DeliveryProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true }
      );
    } else {
      profile = await DeliveryProfile.create(profileFields);
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get Current Driver Profile
 * @route   GET /api/delivery/profile
 * @access  Private (Delivery Role Only)
 */
const getDeliveryProfile = async (req, res) => {
  try {
    const profile = await DeliveryProfile.findOne({
      user: req.user._id,
    }).populate('user', 'firstName lastName phone email');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { updateDeliveryProfile, getDeliveryProfile };
