/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and sanitizes user input across all form submissions
 */

/**
 * Sanitizes string input by removing dangerous characters and scripts
 * @param {string} input - Raw string input
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

/**
 * Sanitizes email addresses to prevent header injection attacks
 * @param {string} email - Raw email input
 * @returns {string} Sanitized lowercase email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";

  return email
    .toLowerCase()
    .replace(/[<>]/g, "")
    .replace(/[\r\n]/g, "")
    .replace(/[;,]/g, "")
    .trim();
};

/**
 * Sanitizes phone numbers by keeping only digits
 * @param {string|number} phone - Raw phone input
 * @returns {string} Numeric string
 */
export const sanitizePhone = (phone) => {
  if (!phone) return "";
  return phone.toString().replace(/[^\d]/g, "");
};

/**
 * Sanitizes name fields allowing letters, spaces, hyphens, and apostrophes
 * @param {string} name - Raw name input
 * @returns {string} Sanitized name
 */
export const sanitizeName = (name) => {
  if (!name || typeof name !== "string") return "";

  // Added Arabic character range \u0621-\u064A
  return name
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/[^A-Za-z\u0621-\u064A\s'-]/g, "") // Keep English, Arabic, space, hyphen, apostrophe
    .trim();
};

/**
 * Sanitizes farm name fields allowing letters, spaces, hyphens, periods, underscores, and apostrophes
 * @param {string} farmName - Raw farm name input
 * @returns {string} Sanitized farm name
 */
export const sanitizeFarmName = (farmName) => {
  if (!farmName || typeof farmName !== "string") return "";

  return farmName
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/[^A-Za-z\u0621-\u064A\s'\-._ ]/g, "") // Keep English, Arabic, space, hyphen, period, underscore, apostrophe
    .trim();
};

/**
 * Sanitizes product name fields - only letters, hyphens, and spaces allowed
 * Enforces strict naming: English/Arabic letters, hyphen (-), and space only
 * @param {string} productName - Raw product name input
 * @returns {string} Sanitized product name
 */
export const sanitizeProductName = (productName) => {
  if (!productName || typeof productName !== "string") return "";

  return (
    productName
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      // Allow ONLY: English letters, Arabic letters, space, and hyphen
      .replace(/[^A-Za-z\u0621-\u064A\s\-]/g, "")
      // Remove consecutive spaces
      .replace(/\s+/g, " ")
      .trim()
  );
};

/**
 * Sanitizes textarea input by HTML-encoding dangerous characters
 * Allows users to include code examples while preventing XSS injection
 * @param {string} text - Raw textarea input
 * @returns {string} HTML-encoded safe text
 */
export const sanitizeTextArea = (text) => {
  if (!text || typeof text !== "string") return "";

  // HTML-encode dangerous characters to prevent XSS while preserving content
  return text
    .replace(/&/g, "&amp;") // Must be first
    .replace(/</g, "&lt;") // Encode < to prevent tag injection
    .replace(/>/g, "&gt;") // Encode > to prevent tag injection
    .replace(/"/g, "&quot;") // Encode quotes
    .replace(/'/g, "&#x27;") // Encode single quotes
    .replace(/\//g, "&#x2F;") // Encode forward slash
    .trim();
};

/**
 * Sanitizes arrays of strings
 * @param {Array} array - Array of strings
 * @returns {Array} Sanitized array with falsy values filtered
 */
export const sanitizeArray = (array) => {
  if (!Array.isArray(array)) return [];
  return array.map((item) => sanitizeString(item)).filter(Boolean);
};

/**
 * Recursively sanitizes form data objects
 * @param {Object} data - Form data object
 * @returns {Object} Sanitized data object
 */
export const sanitizeFormData = (data) => {
  if (!data || typeof data !== "object") return data;

  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      // Check if array contains objects or primitives
      if (value.length > 0 && typeof value[0] === "object") {
        // Array of objects - recursively sanitize each object
        sanitized[key] = value.map((item) => sanitizeFormData(item));
      } else {
        // Array of strings - use sanitizeArray
        sanitized[key] = sanitizeArray(value);
      }
      continue;
    }

    if (typeof value === "object" && !(value instanceof Date)) {
      sanitized[key] = sanitizeFormData(value);
      continue;
    }

    if (typeof value === "string") {
      if (key.toLowerCase().includes("email")) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes("phone")) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes("name")) {
        sanitized[key] = sanitizeName(value);
      } else if (key.toLowerCase().includes("bio") || key.toLowerCase().includes("description")) {
        sanitized[key] = sanitizeTextArea(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export const sanitizeProductData = (productData) => {
  if (!productData || typeof productData !== "object") {
    return {};
  }

  const sanitized = {};

  if (productData.name !== undefined) {
    sanitized.name = sanitizeProductName(productData.name || "");
  }

  if (productData.price !== undefined) {
    sanitized.price =
      typeof productData.price === "number"
        ? productData.price
        : parseFloat(productData.price) || 0;
  }

  if (productData.unit !== undefined) {
    sanitized.unit = sanitizeString(productData.unit || "");
  }

  if (productData.stock !== undefined) {
    sanitized.stock =
      typeof productData.stock === "number"
        ? Math.floor(productData.stock)
        : parseInt(productData.stock, 10) || 0;
  }

  if (productData.description !== undefined) {
    sanitized.description = sanitizeTextArea(productData.description);
  }

  if (productData.imageUrl !== undefined && productData.imageUrl.trim()) {
    sanitized.imageUrl = sanitizeString(productData.imageUrl);
  }

  if (productData.status !== undefined) {
    sanitized.status = sanitizeString(productData.status);
  }

  if (typeof productData.isArchived === "boolean") {
    sanitized.isArchived = productData.isArchived;
  }

  if (productData.category !== undefined) {
    sanitized.category = sanitizeString(productData.category);
  }

  return sanitized;
};
