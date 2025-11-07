import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
    farmer: { // Now links to the Farm
        type: Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    user: { // Links to the customer who placed the order
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    orderItems: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product' },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            unitPrice: { type: Number, required: true } // Price at the time of order
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Incoming', 'Ready for Delivery', 'Completed', 'Cancelled'],
        default: 'Incoming'
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;