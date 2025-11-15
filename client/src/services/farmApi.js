import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Get nearby farms
 * @param {object} params - Object containing latitude and longitude
 * @returns {Promise<Array>} A list of nearby farms
 */
export const getNearbyFarms = async ({ latitude, longitude, distance = 10000 }) => {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.farms.nearby, {
      params: { latitude, longitude, distance },
    });
    return data.data || []; // Ensure it returns the data array from paginated response
  } catch (error) {
    console.error("Error fetching nearby farms:", error);
    throw error;
  }
};

/**
 * Get all farms
 * @returns {Promise<Array>} A list of all farms
 */
export const getAllFarms = async () => {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.farms.allFarms);
    return data.data || []; // Ensure it returns the data array from paginated response
  } catch (error) {
    console.error("Error fetching all farms:", error);
    throw error;
  }
};

// --- TASK 3.2: ADDED FUNCTIONS ---

/**
 * Get the logged-in farmer's private farm profile
 * @returns {Promise<object>} Farmer's farm profile data
 */
export const getMyFarmProfile = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.farms.myFarm);
    return response.data;
  } catch (error) {
    console.error("Error fetching farm profile:", error);
    throw error;
  }
};

/**
 * Update the logged-in farmer's private farm profile
 * @param {object} payload - Profile data to update (farmName, farmBio, location, etc.)
 * @returns {Promise<object>} Updated farm profile data
 */
export const updateMyFarmProfile = async (payload) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.farms.myFarm, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Skip-Sanitization": "true", // Skip sanitizer for complex objects like location
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating farm profile:", error);
    throw error;
  }
};

/**
 * Get dashboard statistics for the logged-in farmer
 * @returns {Promise<object>} Object with product and order counts
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.farms.myFarmStats);
    return response.data; // Returns { products: {...}, orders: {...} }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return a default object on error so the UI doesn't crash
    return { products: { active: 0, inactive: 0, archived: 0 }, orders: {} };
  }
};

/**
 * Get public-facing platform statistics
 * @returns {Promise<object>} Object with public counts
 */
export const getPublicStats = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.farms.publicStats);
    return response.data;
  } catch (error) {
    console.error("Error fetching public stats:", error);
    throw error;
  }
};
