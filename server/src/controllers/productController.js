import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Farmer only)
 */
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the Farm ID associated with the logged-in user
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res
        .status(404)
        .json({ message: "Farm profile not found for this user." });
    }

    const { name, price, unit, stock, category, imageUrl, description } =
      req.body;

    const newProduct = new Product({
      name,
      price,
      unit,
      stock,
      category,
      imageUrl,
      description,
      farm: farm._id, // Use the Farm's ID, not the User's ID
    });

    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get all products for the logged-in farmer (paginated & searchable)
 * @route   GET /api/products/myproducts
 * @access  Private
 */
const getMyProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: "Farm profile not found." });
    }

    // --- Build the base query ---
    const query = { farm: farm._id };

    // --- Add category filter if it exists ---
    if (req.query.category) {
      query.category = req.query.category;
    }

    // --- ADD SEARCH LOGIC ---
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // status filters
    if (req.query.status) {
      query.status = req.query.status;
      query.isArchived = false;
    }

    if (req.query.isArchived === "true") {
      query.isArchived = true; // Convert string 'true' to boolean
    }

    // --- Get total count and paginated data ---
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).skip(skip).limit(limit);

    res.json({
      data: products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get all active, non-archived products for a specific farm (paginated)
 * @route   GET /api/products/farm/:farmId
 * @access  Public
 */
const getProductsByFarm = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {
      farm: req.params.farmId,
      status: "active",
      isArchived: false,
    };

    if (req.query.category) {
      query.category = req.query.category;
    }

    // --- ADD SEARCH LOGIC ---
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).skip(skip).limit(limit);

    res.json({
      data: products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's farm to check for ownership
    const farm = await Farm.findOne({ user: req.user._id });

    // CRITICAL: Ownership Check
    if (product.farm.toString() !== farm._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update the fields
    const {
      name,
      description,
      price,
      unit,
      imageUrl,
      status,
      stock,
      isArchived,
      category,
    } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (unit) product.unit = unit;
    if (imageUrl) product.imageUrl = imageUrl;
    if (status) product.status = status;
    if (stock !== undefined) product.stock = stock;
    if (isArchived !== undefined) product.isArchived = isArchived;
    if (category) product.category = category;

    product = await product.save();
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Archive a product (Soft Delete)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const archiveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's farm to check for ownership
    const farm = await Farm.findOne({ user: req.user._id });

    // CRITICAL: Ownership Check
    if (product.farm.toString() !== farm._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // --- UPDATED LOGIC: Instead of deleting, we update flags ---
    product.isArchived = true;
    product.status = "inactive"; // Also make it inactive for consistency
    await product.save();

    res.json({ message: "Product archived successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get a list of all unique product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getAllCategories = async (req, res) => {
  try {
    // 'distinct' scans the 'category' field across all products
    // and returns an array of unique values.
    const categories = await Product.find().distinct("category");
    // Filter out empty strings and null values
    const validCategories = categories.filter(
      (cat) => cat && cat.trim() !== ""
    );
    res.json(validCategories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export {
  createProduct,
  getMyProducts,
  getProductsByFarm,
  updateProduct,
  archiveProduct,
  getAllCategories,
};
