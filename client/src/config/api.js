import axios from "axios";
// We assume authService is in 'services' folder, one level up
import { getAuthToken, clearAuthData } from "../services/authService";
import { sanitizeFormData } from "../utils/sanitizers";
import { toast } from "react-toastify";

// 1. Centralized API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

/**
 * API Endpoints.
 * Profile management is now split between /api/users/profile and /api/farms/myfarm.
 */
export const API_ENDPOINTS = {
  // /api/users (Replaces old /api/farmers)
  auth: {
    login: "/api/users/login",
    register: "/api/users/register",
    forgotPassword: "/api/users/forgot-password",
    resetPassword: (token) => `/api/users/reset-password/${token}`,
    profile: "/api/users/profile", // GET/PUT /api/users/profile
  },
  
  // Farm-specific profile (farmBio, location) and public discovery
  farms: {
    myFarm: "/api/farms/myfarm", // Farmer-only GET/PUT for their own farm profile
    allFarms: "/api/farms",
    nearby: "/api/farms/nearby", // e.g., /api/farms/nearby?longitude=...
    byId: (farmId) => `/api/farms/${farmId}`,
  },
  
  // Product management (Farmer) and public discovery
  products: {
    create: "/api/products", // POST
    myProducts: "/api/products/myproducts", // GET (Farmer-only)
    byId: (productId) => `/api/products/${productId}`, // PUT, DELETE (Farmer-only)
    publicByFarm: (farmId) => `/api/products/farm/${farmId}`, // GET (Public)
    categories: "/api/products/categories", // GET (Public)
  },
  
  // Order management (Customer & Farmer)
  orders: {
    create: "/api/orders", // POST (Customer) [cite: 6. 🛍️ Cart & Order (Customer Flow)]
    myOrders: "/api/orders/myorders", // GET (Customer or Farmer) [cite: 6. 🛍️ Cart & Order (Customer Flow)]
    updateStatus: (orderId) => `/api/orders/${orderId}/status`, // PUT (Farmer-only) [cite: 7. 🧑‍🌾 Order Management (Farmer Flow)]
  },
  
  // --- CART ENDPOINTS ---
  cart: {
    getCart: "/api/cart", // GET 
    addItem: "/api/cart/item", // POST 
    removeItem: (productId) => `/api/cart/item/${productId}`, // DELETE 
    clearCart: "/api/cart", // DELETE All items
  },
  // ----------------------------------

  // Centralized file uploads
  uploads: {
    uploadImage: "/api/uploads", // POST 
  },
};

const REQUEST_TIMEOUT = 10000; // 10-second timeout

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: REQUEST_TIMEOUT,
});

// 2. Request Interceptor (Sanitization & Auth)
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Sanitize data on POST/PUT requests
    const isModifyingRequest = config.method === "post" || config.method === "put";
    const isJsonContent = config.headers["Content-Type"] === "application/json";
    const skipSanitization = config.headers["X-Skip-Sanitization"] === "true";
    const isFormData = config.data instanceof FormData;

    if (
      isModifyingRequest &&
      config.data &&
      isJsonContent &&
      !isFormData && // Do not sanitize FormData
      !skipSanitization
    ) {
      config.data = sanitizeFormData(config.data);
    }

    delete config.headers["X-Skip-Sanitization"];

    return config;
  },
  (error) => {
    console.error("API request interceptor failed:", error);
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Global Error Handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || "An unexpected error occurred";

    if (status === 401) {
      console.warn("Unauthorized: Session expired or invalid token");
      clearAuthData(); 
      toast.error("Your session has expired. Please log in again.");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }, 1500);
    } else if (status === 403) {
      console.error("Forbidden: Insufficient permissions");
      toast.error("You are not authorized to perform this action.");
    } else if (status && status >= 500) {
      console.error("Server error:", errorMessage);
      toast.error("Server error. Please try again later.");
    } else if (!error.response) {
      console.error("Network error:", error.message);
      toast.error("Network error. Please check your connection.");
    }

    // Return a rejected promise with the error
    return Promise.reject(error);
  }
);

export default apiClient;