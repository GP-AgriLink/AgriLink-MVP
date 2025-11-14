import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    farm: { 
        type: Schema.Types.ObjectId,
        ref: 'Farm', 
        required: true
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "piece", "litre", "bundle", "unit"], // Enforces valid units
    },
    imageUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"], // 'active' = visible to public, 'inactive' = hidden
      default: "active",
    },

    categories: {
        type: [String], 
        required: false,
        index: true // Add an index for faster searching
    },

    // --- Inventory Management ---
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    // --- Soft Delete Flag ---
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
