import { validationResult } from "express-validator";
import User from "../models/User.js";
import Farm from "../models/Farm.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

import Order from "../models/Order.js";
import mongoose from "mongoose";

/**
 * @desc    Register a new user (Customer or Farmer)
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, phone, role, farmName } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create the new User
    const user = await User.create({
      email,
      password,
      phone,
      role,
    });

    // If the user is a farmer, also create their Farm profile
    if (user.role === "farmer") {
      await Farm.create({
        user: user._id,
        farmName: farmName,
      });
    }

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Authenticate a user and get a JWT
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Get the logged-in user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  res.json(req.user);
};

/**
 * @desc    Update a user's profile information
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;
      user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

      // Add logic to update password if needed (requires re-hashing) for future hima----
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        token: generateToken(updatedUser._id), // Re-issue token
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Initiate password reset process
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user with that email found." });
    }

    // 1. Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash token and save to user
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // 3. Send email
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const resetURL = `${clientURL}/reset-password/${resetToken}`;

    // --- CONFIGURE YOUR EMAIL TRANSPORT ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "AgriLink Support <support@agrilink.com>",
      to: user.email,
      subject: "Password Reset Request - AgriLink",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Password Reset Request</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hello,</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              You are receiving this email because you (or someone else) requested a password reset for your AgriLink account.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please click the button below to reset your password. This link will expire in <strong>10 minutes</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #10b981; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
              ${resetURL}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            
            <p style="color: #ef4444; font-size: 14px; line-height: 1.6;">
              ⚠️ <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
              © 2025 AgriLink. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within ten minutes of receiving it:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Token sent to email!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }
};

/**
 * @desc    Reset password with a valid token
 * @route   PUT /api/users/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // 3. Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // pre-save hook will hash the new password

    // 4. Log the user in
    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

/**
 * @desc    Get an annual spending report for the logged-in customer
 * @route   GET /api/users/profile/report
 * @access  Private (Customer or Farmer)
 */
const getCustomerReport = async (req, res) => {
  // This will work for any logged-in user, but is designed for customers
  try {
    // Get User ID
    const userId = req.user._id;

    // Get and validate date range
    const year = parseInt(req.query.year);
    if (!year) {
      return res.status(400).json({ message: "Please provide a valid year." });
    }

    const startDate = new Date(year, 0, 1, 0, 0, 0); // Jan 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59); // Dec 31st

    // --- OPTIMIZATION: Single Pipeline with $facet ---
    // Merges 3 separate queries into 1, reducing database scans by 66%
    const reportData = await Order.aggregate([
      // 1. Common Filter (Uses Index: { user: 1, createdAt: -1 })
      {
        $match: {
          user: userId,
          status: "Completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      // 2. Split into multiple analysis pipelines
      {
        $facet: {
          // Pipeline A: Spending Summary
          spendingSummary: [
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$totalAmount" },
                totalOrdersPlaced: { $sum: 1 },
              },
            },
          ],
          // Pipeline B: Favorite Farm (by total spent)
          favoriteFarm: [
            {
              $group: {
                _id: "$farm",
                totalSpent: { $sum: "$totalAmount" },
                ordersCount: { $sum: 1 },
              },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: "farms",
                localField: "_id",
                foreignField: "_id",
                as: "farmDetails",
              },
            },
            { $unwind: "$farmDetails" },
            {
              $project: {
                _id: 0,
                farmName: "$farmDetails.farmName",
                totalSpent: 1,
                ordersCount: 1,
              },
            },
          ],
          // Pipeline C: Top Products (by quantity)
          topProducts: [
            { $unwind: "$orderItems" },
            {
              $group: {
                _id: "$orderItems.productId",
                name: { $first: "$orderItems.name" },
                totalQuantity: { $sum: "$orderItems.quantity" },
              },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 },
            { $project: { _id: 0, name: 1, totalQuantity: 1 } },
          ],
        },
      },
    ]);

    // Extract results (Facet always returns an array with one document)
    const results = reportData[0];

    // Get the result from the aggregation, or a default object
    const spendingResult = results.spendingSummary[0] || {
      totalSpent: 0,
      totalOrdersPlaced: 0,
    };

    const report = {
      reportYear: year,
      // Manually build the object to exclude the _id
      spendingSummary: {
        totalSpent: spendingResult.totalSpent,
        totalOrdersPlaced: spendingResult.totalOrdersPlaced,
      },
      favoriteFarm: results.favoriteFarm[0] || null, // Can be null if no orders
      topProducts: results.topProducts,
    };

    res.json(report);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getCustomerReport,
};
