import Farm from '../models/Farm.js';
import User from '../models/User.js';

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
            return res.status(404).json({ message: 'Farm profile not found. Please create one.' });
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
    const {
        farmName,
        farmBio,
        avatarUrl,
        specialties,
        location
    } = req.body;

    // Build the profile fields to update
    const profileFields = {};
    if (farmName) profileFields.farmName = farmName;
    if (farmBio) profileFields.farmBio = farmBio;
    if (avatarUrl) profileFields.avatarUrl = avatarUrl;
    if (specialties) profileFields.specialties = specialties;
    
    // Build the location object
    if (location && location.coordinates) {
        profileFields.location = {
            type: 'Point',
            coordinates: location.coordinates
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
            return res.status(404).json({ message: 'Farm profile not found.' });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


// --- Public Routes (These were already correct) ---

/**
 * @desc    Get all farms for the homepage map
 * @route   GET /api/farms
 * @access  Public
 */
const getAllFarms = async (req, res) => {
    try {
        // We now select from 'Farm' model, not 'Farmer'
        const farms = await Farm.find({}).select('farmName specialties location');
        res.json(farms);
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
        const farm = await Farm.findById(req.params.id).populate('user', 'firstName lastName');

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
 * @desc    Get farms within a certain radius
 * @route   GET /api/farms/nearby
 * @access  Public
 */
const getNearbyFarms = async (req, res) => {
    // ... (This logic remains the same, but uses the 'Farm' model)
    const { longitude, latitude, distance } = req.query;
    const maxDistance = distance || 10000;

    if (!longitude || !latitude) {
        return res.status(400).json({ message: 'Please provide longitude and latitude' });
    }

    try {
        const farms = await Farm.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).select('farmName specialties location');
        res.json(farms);
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
    getNearbyFarms
};