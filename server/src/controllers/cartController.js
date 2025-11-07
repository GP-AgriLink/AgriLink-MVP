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

/**
 * @desc    Get the user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
    try {
        const cart = await findOrCreateCart(req.user._id);
        // Populate product details
        await cart.populate('items.product', 'name price imageUrl stock');
        res.json(cart);
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
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const cart = await findOrCreateCart(req.user._id);
        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            // Update quantity
            existingItem.quantity = quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name price imageUrl stock');
        res.status(201).json(cart);

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

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);

        await cart.save();
        await cart.populate('items.product', 'name price imageUrl stock');
        res.json(cart);

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