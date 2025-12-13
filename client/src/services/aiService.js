/**
 * AI Service Client
 * Client-side service for making AI-powered content generation requests to the server
 *
 * SECURITY: API calls are made to server endpoints, keeping the API key secure
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Get authentication token from localStorage
 * @returns {string|null} - JWT token or null if not authenticated
 */
const getAuthToken = () => {
  try {
    const token = localStorage.getItem("token");
    return token;
  } catch (error) {
    console.error('[AI Service] Error retrieving token:', error);
    return null;
  }
};

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise<any>} - Response data
 */
const makeAuthenticatedRequest = async (endpoint, data) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/ai${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return await response.json();
};

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

  const data = await makeAuthenticatedRequest("/product-description", {
    name,
    imageUrl,
    existingDescription,
    productId, // Server uses this for smart file caching
  });

  return data.description;
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

  const data = await makeAuthenticatedRequest("/standardize-category", {
    name,
    imageUrl,
    existingCategory,
    productId, // Server uses this for smart file caching
  });

  return data.category;
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

  const data = await makeAuthenticatedRequest("/farm-bio", {
    farmName,
    locationName,
    specialties,
    existingBio,
  });

  return data.bio;
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

  const data = await makeAuthenticatedRequest("/upload-image", {
    imageUrl,
  });

  return data.fileData;
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

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/files/${fileName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Delete failed: ${response.status}`);
  }

  return await response.json();
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

  const data = await makeAuthenticatedRequest("/img", {
    imageUrl,
    productId,
  });

  return data.fileData;
};

/**
 * Generate AI-powered farm report analysis with predictions and suggestions
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year (e.g., 2024)
 * @returns {Promise<{summary: string, predictions: Array, suggestions: Array, insights: Array}>}
 */
export const generateFarmReportAnalysis = async (month, year, language = 'EN', isDetailed = false) => {
  if (!month || !year) {
    throw new Error("Month and year are required");
  }

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  const data = await makeAuthenticatedRequest("/farm-report-analysis", {
    month,
    year,
    language,
    isDetailed,
  });

  return data;
};

