import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['customer', 'farmer'],
        default: 'customer'
    },
    // Optional fields for profile
    firstName: { type: String },
    lastName: { type: String },
    avatarUrl: { type: String },
    
    // Password reset fields
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
}, {
    timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password matching method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Indexes ---
// Text Index: Allows farmers to quickly search for customers by name, email, or phone
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phone: 'text' });

// --- Global Index (For Landing Page Stats) ---
// Optimizes "Total Customers Joined"
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;