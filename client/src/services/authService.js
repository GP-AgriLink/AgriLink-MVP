/**
 * Authentication Service
 *
 * Handles all authentication-related operations including:
 * - Login/Logout
 * - Registration
 * - Password reset
 * - Token management
 * - Session persistence
 */

import apiClient, { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify"; // Import toast for error handling

const USER_STORAGE_KEY = "user";
const TOKEN_STORAGE_KEY = "token";

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
    try {
        // Check user object first for combined token
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            return userData.token || null;
        }
        // Fallback to standalone token
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
        console.error("Error retrieving auth token:", error);
        return null;
    }
};

/**
 * Get current user data from localStorage
 * @returns {object|null} User object or null
 */
export const getCurrentUser = () => {
    try {
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        return null;
    } catch (error) {
        console.error("Error retrieving user data:", error);
        return null;
    }
};

/**
 * Save user data and token to localStorage
 * @param {object} userData - User data including token
 */
export const saveAuthData = (userData) => {
    if (!userData || !userData.token) {
        console.error("Invalid user data: token is required", userData);
        throw new Error("Invalid user data: token is required");
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_STORAGE_KEY, userData.token);
};

/**
 * Clear all authentication data, and all application-related storage
 */
export const clearAuthData = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    // Clear related application state
    localStorage.removeItem("dashboardActiveView");
    localStorage.removeItem("incomingOrdersCount");

    // Clear any other potentially stale keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
            key &&
            (key.includes("auth") ||
                key.includes("token") ||
                key.includes("user") ||
                key.includes("session") ||
                key.includes("incoming") ||
                key.includes("dashboard"))
        ) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    const token = getAuthToken();
    const user = getCurrentUser();
    return !!(token && user);
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const login = async (email, password) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.auth.login, {
            email,
            password,
        });
        const userData = response.data;

        if (!userData.token) {
            throw new Error("No token received from server");
        }

        saveAuthData(userData);

        return { success: true, user: userData };
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.errors?.[0]?.msg ||
            "Login failed. Please try again.";

        console.error("Login error:", errorMessage);
        return { success: false, error: errorMessage };
    }
};

/**
 * Register new user
 * @param {string} farmName - Farm name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} phoneNumber - User phone number
 * @returns {Promise<{success: boolean, user?: object, error?: string, field?: string}>}
 */
export const register = async (farmName, email, password, phoneNumber) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.auth.register, {
            farmName,
            email,
            password,
            phoneNumber, // Pass phoneNumber to the API
        });

        const userData = response.data;
        if (!userData.token) {
            throw new Error("No token received from server");
        }

        saveAuthData(userData);

        return { success: true, user: userData };
    } catch (error) {
        // Handle specific field errors from express-validator
        if (error.response?.data?.errors) {
            const firstError = error.response.data.errors[0];
            console.error("Registration validation error:", firstError.msg);
            return {
                success: false,
                error: firstError.msg,
                field: firstError.path || "email", // 'path' is used by express-validator
            };
        }

        const errorMessage =
            error.response?.data?.message ||
            "Registration failed. Please try again.";

        console.error("Registration error:", errorMessage);
        return { success: false, error: errorMessage, field: "email" };
    }
};

/**
 * Logout user
 * Clears all authentication data and redirects to login
 */
export const logout = () => {
    clearAuthData();
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const forgotPassword = async (email) => {
    try {
        await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
        return { success: true };
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            "Failed to send reset email. Please try again.";

        // Do not toast error here, let the component handle it
        console.error("Forgot password error:", errorMessage);
        return { success: false, error: errorMessage };
    }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const resetPassword = async (token, newPassword) => {
    try {
        // Note: This endpoint is PUT, not POST
        await apiClient.put(`${API_ENDPOINTS.auth.resetPassword}/${token}`, {
            password: newPassword,
        });
        return { success: true };
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            "Failed to reset password. Please try again.";

        console.error("Reset password error:", errorMessage);
        // Let the component toast the error
        return { success: false, error: errorMessage };
    }
};

/**
 * Verify if token is still valid
 * @returns {Promise<boolean>}
 */
export const verifyToken = async () => {
    try {
        const token = getAuthToken();
        if (!token) return false;

        // Make a lightweight request to verify token
        // The interceptor will handle 401s
        await apiClient.get(API_ENDPOINTS.farmers.profile);
        return true;
    } catch (error) {
        console.error("Token verification failed:", error);
        // The 401 interceptor will handle clearing data and redirecting
        return false;
    }
};

export default {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getAuthToken,
    getCurrentUser,
    saveAuthData,
    clearAuthData,
    isAuthenticated,
    verifyToken,
};
