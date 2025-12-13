import apiClient, { API_ENDPOINTS } from "../config/api";
import { sanitizeProductData } from "../utils/sanitizers";

/**
 * Create a new product (Protected endpoint)
 *
 * @param {object} productData - Product data as JSON object
 * @returns {Promise<object>} Created product object
 * @throws {Error} 400 Bad Request if validation fails
 */
export const createProduct = async (productData) => {
  try {
    // Sanitize and send as JSON
    const dataToSend = sanitizeProductData(productData);

    const response = await apiClient.post(API_ENDPOINTS.products.create, dataToSend);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      "Failed to create product";
    throw new Error(errorMessage);
  }
};

/**
 * Get all products for the logged-in farmer (Protected endpoint)
 *
 * @param {object} params - Query parameters object containing page, limit, category, search, status, isArchived
 * @returns {Promise<object>} Paginated product object { data: [], page, pages, total }
 */
export const getMyProducts = async (params = {}) => {
  try {
    // Filter out undefined/null values and empty strings
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        cleanParams[key] = params[key];
      }
    });

    const response = await apiClient.get(API_ENDPOINTS.products.myProducts, {
      params: cleanParams,
    });
    // Return the full paginated object from the server
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch products";
    throw new Error(errorMessage); // Re-throw for the page to handle
  }
};

/**
 * Get all unique product categories (Public endpoint)
 *
 * @returns {Promise<Array>} Array of category strings
 */
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.products.categories);
    return response.data || []; // Returns an array of strings
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch categories";
    throw new Error(errorMessage);
  }
};

/**
 * Get public products from a specific farm (Public endpoint)
 *
 * @param {string} farmId - Farm ID
 * @param {object} params - Query parameters (page, limit, search, category)
 * @returns {Promise<object>} Paginated product object { data: [], page, pages, total }
 */
export const getPublicProductsByFarm = async (farmId, params = {}) => {
  try {
    // Filter out undefined/null values and empty strings
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        cleanParams[key] = params[key];
      }
    });

    const response = await apiClient.get(API_ENDPOINTS.products.publicByFarm(farmId), {
      params: cleanParams,
    });
    // Return the full paginated object from the server
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch products";
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing product (Protected endpoint)
 *
 * @param {string} productId - Product ID
 * @param {object} updateData - Fields to update as JSON object
 * @returns {Promise<object>} Updated product object
 * @throws {Error} 404 if product not found
 */
export const updateProduct = async (productId, updateData) => {
  try {
    // Sanitize and send as JSON
    const dataToSend = sanitizeProductData(updateData);

    // Use the standardized 'byId' endpoint for PUT requests
    const response = await apiClient.put(API_ENDPOINTS.products.byId(productId), dataToSend);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      "Failed to update product";
    throw new Error(errorMessage);
  }
};

/**
 * Archive a product (Protected endpoint - Soft delete)
 *
 * @param {string} productId - Product ID to archive
 * @returns {Promise<object>} Success message
 */
export const archiveProduct = async (productId) => {
  try {
    // Use the standardized 'byId' endpoint for DELETE requests
    const response = await apiClient.delete(API_ENDPOINTS.products.byId(productId));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to archive product";
    throw new Error(errorMessage);
  }
};
