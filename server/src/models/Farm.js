import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    farmName: {
      type: String,
      required: true,
    },
    // Optional fields for profile
    farmBio: { type: String, maxLength: 500 },
    avatarUrl: { type: String }, // Can be separate from user avatar
    specialties: [String],
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // All new farms start here
    },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
farmSchema.index({ location: '2dsphere' });

const Farm = mongoose.model('Farm', farmSchema);
export default Farm;
