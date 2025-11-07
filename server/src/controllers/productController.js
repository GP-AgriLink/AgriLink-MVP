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
    // 2. Find the Farm ID associated with the logged-in user
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res
        .status(404)
        .json({ message: "Farm profile not found for this user." });
    }

    const { name, price, unit, stock } = req.body;

    const newProduct = new Product({
      name,
      price,
      unit,
      stock,
      farmer: farm._id, // 3. Use the Farm's ID, not the User's ID
    });

    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get all products for the logged-in farmer (including archived)
 * @route   GET /api/products/myproducts
 * @access  Private (Farmer only)
 */
const getMyProducts = async (req, res) => {
  try {
    // 4. Find the farm associated with the user first
    const farm = await Farm.findOne({ user: req.user._id });
    if (!farm) {
      return res.status(404).json({ message: "Farm profile not found." });
    }

    // 5. Find products belonging to that farm
    const products = await Product.find({ farmer: farm._id });
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get all active, non-archived products for a specific farm
 * @route   GET /api/products/farm/:farmId
 * @access  Public
 */
const getProductsByFarm = async (req, res) => {
  try {
    // This logic remains the same, but it's good to confirm
    const products = await Product.find({
      farmer: req.params.farmId, // The ID in the URL is the Farm ID
      status: "active",
      isArchived: false,
    });
    res.json(products);
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
    if (product.farmer.toString() !== farm._id.toString()) {
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
    } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (unit) product.unit = unit;
    if (imageUrl) product.imageUrl = imageUrl;
    if (status) product.status = status;
    if (stock !== undefined) product.stock = stock;
    if (isArchived !== undefined) product.isArchived = isArchived;

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
    if (product.farmer.toString() !== farm._id.toString()) {
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

export {
  createProduct,
  getMyProducts,
  getProductsByFarm,
  updateProduct,
  archiveProduct,
};
