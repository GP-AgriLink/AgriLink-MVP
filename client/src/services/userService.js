/**
 * Handles management of the user's PERSONAL profile data
 * (e.g., firstName, lastName, avatarUrl) via /api/users/profile.
 */
import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Get the logged-in user's personal profile
 * @returns {Promise<object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.users.profile);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update the logged-in user's personal profile
 * @param {object} payload - Profile data to update (e.g., { firstName, avatarUrl })
 * @returns {Promise<object>} Updated user profile data
 */
export const updateUserProfile = async (payload) => {
  try {
    // Send as JSON, server handles hashing/updates
    const response = await apiClient.put(API_ENDPOINTS.users.profile, payload, {
      headers: {
        "Content-Type": "application/json",
        // Skip the general sanitizer in api.js if sending complex data
        // 'X-Skip-Sanitization': 'true'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update the logged-in user's password
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<object>} Response data
 */
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.users.updatePassword, {
      currentPassword,
      newPassword,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updatePassword,
};
