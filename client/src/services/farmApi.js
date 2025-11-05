import apiClient, { API_ENDPOINTS } from '../config/api';

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
    return data || [];
  } catch (error) {
    console.error('Error fetching nearby farms:', error);
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
    return data || [];
  } catch (error) {
    console.error('Error fetching all farms:', error);
    throw error;
  }
};