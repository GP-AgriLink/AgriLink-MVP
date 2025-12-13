/**
 * @file server.js
 * @description This is the main entry point for the AgriLink backend server.
 * It initializes the Express application, connects to the database,
 * applies essential middleware, and mounts the API routes.
 */

// --- Module Imports ---
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import farmRoutes from "./src/routes/farmRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import cors from "cors";

// --- Configuration ---
// Load environment variables from the .env file into process.env
dotenv.config();

// Establish the connection to the MongoDB database
connectDB();

// Initialize the Express application
const app = express();

// To connect with client
const allowedOrigins = [
  "https://agrilink-server.vercel.app",
  /http:\/\/localhost:\d+/,
  /http:\/\/127.0.0.1:\d+/,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in our allowed list (or matches regex)
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// --- Middleware ---
// This middleware is essential for parsing incoming request bodies with JSON payloads.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- API Routes ---
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/uploads", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
// --- Error Handling Middleware ---
// Custom middleware to handle 404 Not Found errors.
app.use(notFound);
// Custom middleware to handle all other errors, ensuring a consistent JSON response.
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`🚀 Server running on port ${PORT}`));
