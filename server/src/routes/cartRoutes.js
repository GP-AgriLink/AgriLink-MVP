import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getCart,
    addCartItem,
    removeCartItem,
    clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/item', addCartItem);
router.delete('/item/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;