import axios from "axios";
import { getAuthToken, clearAuthData } from "../services/authService";
import { sanitizeFormData } from "../utils/sanitizers";
import { toast } from "react-toastify";
// Import toast for interceptor errors

// 1. Centralized API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  auth: {
    login: "/api/farmers/login",
    register: "/api/farmers/register",
    forgotPassword: "/api/farmers/forgot-password",
    resetPassword: "/api/farmers/reset-password",
  },
  farmers: {
    profile: "/api/farmers/profile",
    uploadPicture: "/api/farmers/profile/upload-picture",
  },
  farms: {
    allFarms: "/api/farms",
    nearby: "/api/farms/nearby",
    byId: (farmId) => `/api/farms/${farmId}`,
  },
  orders: {
    myOrders: "/api/orders/myorders",
    incomingCount: "/api/orders/count/incoming",
    create: "/api/orders",
    updateStatus: (orderId) => `/api/orders/${orderId}/status`,
  },
  products: {
    myProducts: "/api/products/myproducts",
    create: "/api/products",
    byId: (productId) => `/api/products/${productId}`,
    publicByFarm: (farmId) => `/api/products/farm/${farmId}`,
    uploadImage: (productId) => `/api/products/${productId}/upload-image`,
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
    const isModifyingRequest =
      config.method === "post" || config.method === "put";
    const isJsonContent =
      config.headers["Content-Type"] === "application/json";
    const skipSanitization =
      config.headers["X-Skip-Sanitization"] === "true";

    if (
      isModifyingRequest &&
      config.data &&
      isJsonContent &&
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
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";

    if (status === 401) {
      // Unauthorized: Token expired or invalid
      console.warn("Unauthorized: Session expired or invalid token");
      clearAuthData();
      toast.error("Your session has expired. Please log in again.");
      // Delay redirect slightly to allow toast to be seen
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }, 1500);
    } else if (status === 403) {
      // Forbidden
      console.error("Forbidden: Insufficient permissions");
      toast.error("You are not authorized to perform this action.");
    } else if (status && status >= 500) {
      // Server error
      console.error("Server error:", errorMessage);
      toast.error("Server error. Please try again later.");
    } else if (!error.response) {
      // Network error (timeout, CORS, etc.)
      console.error("Network error:", error.message);
      toast.error("Network error. Please check your connection.");
    }

    // Return a rejected promise with the error
    return Promise.reject(error);
  }
);

export default apiClient;