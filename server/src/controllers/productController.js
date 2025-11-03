import { validationResult } from "express-validator";
import Product from "../models/Product.js";

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, price, unit, stock } = req.body;
    req.body;
    const newProduct = new Product({
      name,
      price,
      unit,
      stock,
      farmer: req.farmer._id, // This ID comes from the 'protect' middleware!
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
 * @access  Private
 */
const getMyProducts = async (req, res) => {
  try {
    // This query intentionally fetches ALL products, including archived ones,
    // so the farmer can see and potentially restore them from their dashboard.
    const products = await Product.find({ farmer: req.farmer._id });
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
    // Find products by the farm ID in the URL, and only show 'active' ones
    const products = await Product.find({
      farmer: req.params.farmId,
      status: "active",
      isArchived: false, // Only show products that are not archived
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

    // --- CRITICAL: Ownership Check ---
    if (product.farmer.toString() !== req.farmer._id.toString()) {
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

    // --- CRITICAL: Ownership Check ---
    if (product.farmer.toString() !== req.farmer._id.toString()) {
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
 * @desc    Upload an image for a product
 * @route   POST /api/products/:id/upload-image
 * @access  Private
 */
const uploadProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // --- Ownership Check ---
    if (product.farmer.toString() !== req.farmer._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!req.file || !req.file.base64) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Store base64 string directly in the database
    product.imageUrl = req.file.base64;
    await product.save();

    res.json({
      message: "Image uploaded successfully",
      imageUrl: product.imageUrl,
    });
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
  uploadProductImage, // Add new export
};