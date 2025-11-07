import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    // Denormalized data for easier cart display
    name: { type: String },
    price: { type: Number },
    imageUrl: { type: String }
});

const cartSchema = new Schema({
    user: { // The link to the customer
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each user has only one cart
    },
    items: [cartItemSchema],
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;