/**
 * Product Service
 *
 * Handles all product-related API operations for farmer dashboard
 * Implements sanitization and validation per myprod.md API contract
 */

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

    const response = await apiClient.post(
      API_ENDPOINTS.products.create,
      dataToSend
    );
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
 * @returns {Promise<Array>} Array of product objects
 */
export const getMyProducts = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.products.myProducts);
    return response.data || [];
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch products";
    throw new Error(errorMessage); // Re-throw for the page to handle
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
    const response = await apiClient.put(
      API_ENDPOINTS.products.byId(productId),
      dataToSend
    );
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
    const response = await apiClient.delete(
      API_ENDPOINTS.products.byId(productId)
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to archive product";
    throw new Error(errorMessage);
  }
};

/**
 * Restore an archived product (Protected endpoint)
 *
 * @param {string} productId - Product ID to restore
 * @returns {Promise<object>} Updated product object
 */
export const restoreProduct = async (productId) => {
  try {
    // Restore is just an update setting isArchived to false
    const restoredProduct = await updateProduct(productId, {
      isArchived: false,
      status: "active", // Also reset status to active
    });
    return restoredProduct;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      "Failed to restore product";
    throw new Error(errorMessage);
  }
};

/**
 * Upload an image for a product (Protected endpoint)
 *
 * @param {string} productId - Product ID
 * @param {File} file - The image file to upload
 * @returns {Promise<object>} Object containing the new imageUrl
 */
export const uploadProductImage = async (productId, file) => {
  try {
    const formData = new FormData();
    formData.append("productImage", file);

    const response = await apiClient.post(
      API_ENDPOINTS.products.uploadImage(productId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data; // { message, imageUrl }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to upload image";
    throw new Error(errorMessage);
  }
};