import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { protect, isDriver } from '../middleware/authMiddleware.js';
import {
  updateDeliveryProfile,
  getDeliveryProfile,
} from '../controllers/deliveryController.js';

const router = express.Router();

router.use(protect, isDriver);

router
  .route('/profile')
  .get(getDeliveryProfile)
  .post(
    [
      body('vehicleType', 'Vehicle type is required').not().isEmpty(),
      body('vehicleType', 'Invalid vehicle type').isIn([
        'Motorcycle',
        'Car',
        'Van',
        'Bicycle',
      ]),
      body('licensePlate', 'License plate is required').not().isEmpty(),
      body('nationalId', 'National ID is required').not().isEmpty(),
      body('licenseUrl', 'License image URL is required').not().isEmpty(),
      body('nationalIdUrl', 'National ID image URL is required')
        .not()
        .isEmpty(),
    ],
    validate,
    updateDeliveryProfile
  );

export default router;
