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
            .select('farmName specialties location')
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
 * @desc    Get farms within a certain radius (paginated)
 * @route   GET /api/farms/nearby
 * @access  Public
 */
const getNearbyFarms = async (req, res) => {
    const { longitude, latitude, distance } = req.query;
    const maxDistance = distance || 10000; // 10km default

    if (!longitude || !latitude) {
        return res.status(400).json({ message: 'Please provide longitude and latitude' });
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
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    distanceField: 'distance', // This adds a 'distance' field to each document
                    maxDistance: parseInt(maxDistance),
                    spherical: true, // Use spherical geometry (like $nearSphere)
                }
            },
            {
                // Select only the fields we want to return
                $project: {
                    farmName: 1,
                    specialties: 1,
                    location: 1,
                    distance: 1 // We can also return the calculated distance
                }
            },
            {
                // $facet allows us to run two pipelines at once:
                // one for the paginated data and one for the total count.
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    pagination: [
                        { $count: 'total' }
                    ]
                }
            }
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