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
 * @desc    Update user password
 * @route   PUT /api/users/profile/password
 * @access  Private
 */
const updateUserPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Ensure new password is different from current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
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
      subject: "🔒 Password Reset Request - AgriLink",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Password Reset - AgriLink</title>
          <!--[if mso]>
          <style type="text/css">
            table {border-collapse: collapse;}
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <!-- Email Container -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Email Card -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <!-- Logo/Icon -->
                            <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                              <span style="font-size: 40px;">🔒</span>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Password Reset Request</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 14px;">Secure your AgriLink account</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                            
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
                              We received a request to reset the password for your <strong style="color: #10b981;">AgriLink</strong> account. If you made this request, click the button below to set a new password.
                            </p>
                            
                            <!-- Timer Notice -->
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 0 0 30px;">
                              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                                <strong>⏱️ Time Sensitive:</strong> This reset link will expire in <strong>10 minutes</strong> for security reasons.
                              </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td align="center" style="padding: 20px 0 30px;">
                                  <!--[if mso]>
                                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetURL}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" stroke="f" fillcolor="#10b981">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Reset My Password</center>
                                  </v:roundrect>
                                  <![endif]-->
                                  <!--[if !mso]><!-->
                                  <a href="${resetURL}" style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);" target="_blank">
                                    🔓 Reset My Password
                                  </a>
                                  <!--<![endif]-->
                                </td>
                              </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 0 0 25px;">
                              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 10px;">
                                <strong>Button not working?</strong> Copy and paste this link into your browser:
                              </p>
                              <p style="color: #10b981; font-size: 13px; word-break: break-all; margin: 0; font-family: 'Courier New', monospace;">
                                ${resetURL}
                              </p>
                            </div>
                            
                            <!-- Security Warning -->
                            <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin: 0 0 20px;">
                              <p style="color: #991b1b; font-size: 14px; line-height: 1.5; margin: 0;">
                                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged.
                              </p>
                            </div>
                            
                            <!-- Help Text -->
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                              Need help? Contact us at <a href="mailto:support@agrilink.com" style="color: #10b981; text-decoration: none; font-weight: 600;">support@agrilink.com</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 30px;">
                      <div style="border-top: 2px solid #e5e7eb;"></div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <p style="color: #10b981; font-size: 20px; font-weight: 700; margin: 0 0 15px; letter-spacing: 0.5px;">
                              🌱 AgriLink
                            </p>
                            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 15px;">
                              Connecting farms to communities<br>
                              Fresh. Local. Sustainable.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                              © 2025 AgriLink. All rights reserved.<br>
                              This is an automated message, please do not reply to this email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Password Reset Request - AgriLink\n\nHello,\n\nWe received a request to reset the password for your AgriLink account.\n\nPlease click on the following link, or paste it into your browser to complete the process within 10 minutes:\n\n${resetURL}\n\n⏱️ TIME SENSITIVE: This link will expire in 10 minutes for security reasons.\n\n⚠️ SECURITY NOTICE: If you did not request this password reset, please ignore this email or contact our support team. Your password will remain unchanged.\n\nNeed help? Contact us at support@agrilink.com\n\n---\n🌱 AgriLink\nConnecting farms to communities\nFresh. Local. Sustainable.\n\n© 2025 AgriLink. All rights reserved.\nThis is an automated message, please do not reply to this email.`,
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
  updateUserPassword,
  forgotPassword,
  resetPassword,
  getCustomerReport,
};
