/**
 * AI Service Client
 * Client-side service for making AI-powered content generation requests to the server
 *
 * SECURITY: API calls are made to server endpoints, keeping the API key secure
 */

import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Generate product description using AI
 * @param {string} name - Product name
 * @param {string} imageUrl - Optional image URL
 * @param {string} existingDescription - Optional existing description
 * @param {string|null} productId - Optional product ID for smart caching (EditProduct)
 * @returns {Promise<string>} - Generated description
 */
export const generateProductDescription = async (
  name,
  imageUrl = "",
  existingDescription = "",
  productId = null
) => {
  if (!name || !name.trim()) {
    throw new Error("Product name is required");
  }

  const response = await apiClient.post(API_ENDPOINTS.ai.productDescription, {
    name,
    imageUrl,
    existingDescription,
    productId, // Server uses this for smart file caching
  });

  return response.data.description;
};

/**
 * Standardize product category using AI
 * @param {string} name - Product name
 * @param {string} imageUrl - Optional image URL
 * @param {string} existingCategory - Optional existing category
 * @param {string|null} productId - Optional product ID for smart caching (EditProduct)
 * @returns {Promise<string>} - Standardized category
 */
export const standardizeCategory = async (
  name,
  imageUrl = "",
  existingCategory = "",
  productId = null
) => {
  if (!name || !name.trim()) {
    throw new Error("Product name is required");
  }

  const response = await apiClient.post(API_ENDPOINTS.ai.standardizeCategory, {
    name,
    imageUrl,
    existingCategory,
    productId, // Server uses this for smart file caching
  });

  return response.data.category;
};

/**
 * Generate farm bio using AI
 * @param {string} farmName - Farm name
 * @param {string} locationName - Location name (e.g., "Cairo, Egypt")
 * @param {string[]} specialties - Farm specialties
 * @param {string} existingBio - Optional existing bio
 * @returns {Promise<string>} - Generated bio
 */
export const generateFarmBio = async (
  farmName,
  locationName = null,
  specialties = [],
  existingBio = ""
) => {
  if (!farmName || !farmName.trim()) {
    throw new Error("Farm name is required");
  }

  const response = await apiClient.post(API_ENDPOINTS.ai.farmBio, {
    farmName,
    locationName,
    specialties,
    existingBio,
  });

  return response.data.bio;
};

/**
 * Upload image to AI File API
 * @param {string} imageUrl - URL of the image to upload
 * @returns {Promise<{uri: string, mimeType: string, name: string}>} - Uploaded file data
 */
export const uploadImageToAI = async (imageUrl) => {
  if (!imageUrl || !imageUrl.trim()) {
    throw new Error("Image URL is required");
  }

  const response = await apiClient.post(API_ENDPOINTS.ai.uploadImage, {
    imageUrl,
  });

  return response.data.fileData;
};

/**
 * Delete file from File API
 * @param {string} fileName - Name of the file to delete (e.g., 'files/abc123')
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileName) => {
  if (!fileName) {
    throw new Error("File name is required");
  }

  const response = await apiClient.delete(API_ENDPOINTS.ai.deleteFile(fileName));
  return response.data;
};

/**
 * Cache product image with smart file reuse
 * Checks if file already exists for product ID, reuses if found (48h cache)
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} productId - Product ID for caching
 * @returns {Promise<{uri: string, mimeType: string, name: string, displayName: string}>} - File data
 */
export const cacheProductImage = async (imageUrl, productId) => {
  if (!imageUrl || !imageUrl.trim()) {
    throw new Error("Image URL is required");
  }

  if (!productId || !productId.trim()) {
    throw new Error("Product ID is required");
  }

  const response = await apiClient.post(API_ENDPOINTS.ai.cacheImage, {
    imageUrl,
    productId,
  });

  return response.data.fileData;
};

/**
 * Generate AI-powered farm report analysis with predictions and suggestions
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year (e.g., 2024)
 * @param {string} language - Language code ('EN' or 'AR')
 * @param {boolean} isDetailed - Whether to generate detailed analysis
 * @returns {Promise<{summary: string, predictions: Array, suggestions: Array, insights: Array}>}
 */
export const generateFarmReportAnalysis = async (
  month,
  year,
  language = "EN",
  isDetailed = false
) => {
  if (!month || !year) {
    throw new Error("Month and year are required");
  }

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  const response = await apiClient.post(API_ENDPOINTS.ai.farmReportAnalysis, {
    month,
    year,
    language,
    isDetailed,
  });

  return response.data;
};
