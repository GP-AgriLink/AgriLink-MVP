import express from "express";
import { body } from "express-validator";
import {
  registerFarmer,
  loginFarmer,
  getFarmerProfile,
  updateFarmerProfile,
  forgotPassword,
  resetPassword,
  uploadFarmerAvatar,
} from "../controllers/farmerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, convertToBase64 } from "../config/upload.js";

const router = express.Router();

// --- Public Routes ---

// @route   POST /api/farmers/register
router.post(
  "/register",
  [
    body("farmName", "Farm name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
    body("phoneNumber", "Please include a valid phone number")
      .not()
      .isEmpty()
      .isMobilePhone("ar-EG"),
  ],
  registerFarmer
);

// @route   POST /api/farmers/login
router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  loginFarmer
);

// --- PASSWORD RESET ROUTES ---
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// --- Private Routes ---

// @route   GET & PUT /api/farmers/profile
router
  .route("/profile")
  .get(protect, getFarmerProfile)
  .put(protect, updateFarmerProfile);

// @route   POST /api/farmers/profile/upload-picture
// @desc    Upload a new farmer avatar
// @access  Private
router.post(
  "/profile/upload-picture",
  protect,
  upload.single("profilePicture"),
  convertToBase64,
  uploadFarmerAvatar
);

export default router;