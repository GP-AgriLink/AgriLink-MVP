import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
    farm: { // Now links to the Farm
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

// --- Indexes ---
// 1. Farmer Dashboard: 
//    Optimizes filtering by farm/status/date AND enables "Covered Query" for revenue (totalAmount is in index)
orderSchema.index({ farm: 1, status: 1, createdAt: -1, totalAmount: 1 });

// 2. Customer Dashboard:
//    Optimizes "My Orders" AND "Customer Report" (filters by user + status, sorts by date)
orderSchema.index({ user: 1, status: 1, createdAt: -1 });

// --- Global Indexes (For Landing Page Stats) ---
// 3. Landing Page Sales:
//    Optimizes "Total Completed Orders" count AND "Total Sales" sum (Covered Query)
orderSchema.index({ status: 1, totalAmount: 1 });     

// 4. Landing Page Activity:
//    Optimizes "Orders in last 24 hours"
orderSchema.index({ createdAt: -1 }); 

const Order = mongoose.model('Order', orderSchema);
export default Order;