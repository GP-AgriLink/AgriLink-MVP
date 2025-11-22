import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper function to get or create a cart
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Helper to populate the cart for responses
const getPopulatedCart = (cart) => {
  return cart.populate([
    { path: 'items.product', select: 'name price imageUrl stock' },
    { path: 'items.farm', select: 'farmName avatarUrl' },
  ]);
};

/**
 * @desc    Get the user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    const populatedCart = await getPopulatedCart(cart);
    res.json(populatedCart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Add or update an item in the cart
 * @route   POST /api/cart/item
 * @access  Private
 */
const addCartItem = async (req, res) => {
  // Default quantity to 1 if not sent
  const { productId, quantity = 1 } = req.body;

  try {
    // Find the product and its farm
    const product = await Product.findById(productId);

    // Business Logic Validation
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.isArchived || product.status === 'inactive') {
      return res
        .status(400)
        .json({ message: 'This product is no longer available' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const cart = await findOrCreateCart(req.user._id);

    // Check if item exists to update quantity vs add new
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity = quantity;
    } else {
      // Add new item (Farm-Aware)
      cart.items.push({
        product: productId,
        farm: product.farm,
        quantity,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }

    await cart.save();
    const populatedCart = await getPopulatedCart(cart);
    res.status(201).json(populatedCart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/cart/item/:productId
 * @access  Private
 */
const removeCartItem = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user._id);

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    const populatedCart = await getPopulatedCart(cart);
    res.json(populatedCart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Clear all items from the cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

export { getCart, addCartItem, removeCartItem, clearCart };
