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

    category: {
        type: String, 
        required: true,
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

// --- Indexes ---
// Compound Index: Optimizes dashboard filtering by farm + status + archived state
productSchema.index({ farm: 1, status: 1, isArchived: 1 });

// Text Index: Enables high-performance text search on name and description
// Weights give 'name' higher priority in search results than 'description'
productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 5 } }
);

// --- Global Index (For Landing Page Stats) ---
// Optimizes "Total Active Products" & "New Products This Week" queries
productSchema.index({ status: 1, isArchived: 1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;