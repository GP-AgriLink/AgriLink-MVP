import apiClient, { API_ENDPOINTS } from "../config/api";

const USER_STORAGE_KEY = "user";
const TOKEN_STORAGE_KEY = "token";

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  try {
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
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

/**
 * Save user data and token to localStorage
 * @param {object} userData - User data from login/register response
 */
export const saveAuthData = (userData) => {
  if (!userData || !userData.token || !userData._id) {
    console.error("Invalid user data: token and _id are required", userData);
    throw new Error("Invalid user data: token and _id are required");
  }

  const userToSave = {
    _id: userData._id,
    email: userData.email,
    role: userData.role,
    avatarUrl: userData.avatarUrl || "",
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToSave));
  // Store the token separately for the API interceptor
  localStorage.setItem(TOKEN_STORAGE_KEY, userData.token);
};

/**
 * Updates the user object in localStorage.
 * Used to keep the Navbar in sync after a profile edit.
 * @param {object} updatedUser - The fresh user object from the API
 */
export const updateUserInStorage = (updatedUser) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const userToSave = {
      ...currentUser,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToSave));
  } catch (error) {
    console.error("Failed to update user in storage:", error);
  }
};

/**
 * Clear all authentication data and related application storage
 */
export const clearAuthData = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem("dashboardActiveView");
  localStorage.removeItem("avatarUrl");
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
    return { success: true, user: getCurrentUser() };
  } catch (error) {
    let errorMessage = "Login failed. Please try again.";
    if (error.response?.status === 401) {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors[0].msg;
    }
    console.error("Login error:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Register new user
 * @param {string} farmName - Farm name (undefined for customers)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} phoneNumber - User phone number
 * @param {string} role - 'customer' or 'farmer'
 * @returns {Promise<{success: boolean, user?: object, error?: string, field?: string}>}
 */
export const register = async (farmName, email, password, phoneNumber, role) => {
  try {
    // Registration payload
    const payload = {
      email,
      password,
      phone: phoneNumber,
      role: role,
    };

    // Conditionally add farmName only if role is 'farmer'
    if (role === "farmer") {
      payload.farmName = farmName;
    }

    const response = await apiClient.post(API_ENDPOINTS.auth.register, payload);

    const userData = response.data;
    if (!userData.token) {
      throw new Error("No token received from server");
    }

    saveAuthData(userData);
    return { success: true, user: getCurrentUser() };
  } catch (error) {
    if (error.response?.data?.errors) {
      const firstError = error.response.data.errors[0];
      console.error("Registration validation error:", firstError.msg);
      return {
        success: false,
        error: firstError.msg,
        field: firstError.param || "email",
      };
    }
    const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
    console.error("Registration error:", errorMessage);
    return { success: false, error: errorMessage, field: "email" };
  }
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuthData();
  if (typeof window !== "undefined") {
    // Force a full redirect to clear all application state
    window.location.href = "/login";
  }
};

export const forgotPassword = async (email) => {
  try {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to send reset email. Please try again.";
    console.error("Forgot password error:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    await apiClient.put(API_ENDPOINTS.auth.resetPassword(token), {
      password: newPassword,
    });
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to reset password. Please try again.";
    console.error("Reset password error:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

export const verifyToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    // Call the user profile endpoint
    await apiClient.get(API_ENDPOINTS.users.profile);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    // The 401 interceptor in api.js will handle clearing data
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
  updateUserInStorage,
};
