import mongoose from 'mongoose';

const deliveryProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['Motorcycle', 'Car', 'Van', 'Bicycle'],
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
    },
    nationalId: {
      // Important for security/background checks
      type: String,
      required: true,
    },
    documents: {
      // URLs to uploaded images
      licenseUrl: { type: String, required: true },
      nationalIdUrl: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      // Optional: To tell them why they were rejected
      type: String,
    },
    isAvailable: {
      // Driver toggle for "I am working now"
      type: Boolean,
      default: false,
    },
    currentLocation: {
      // For finding nearby orders later
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries (finding nearest driver)
deliveryProfileSchema.index({ currentLocation: '2dsphere' });

const DeliveryProfile = mongoose.model(
  'DeliveryProfile',
  deliveryProfileSchema
);
export default DeliveryProfile;
