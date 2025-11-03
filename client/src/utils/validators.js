/**
 * Input Validation Utilities
 * Business logic validation functions for form inputs and file uploads
 */

/**
 * Validates Egyptian mobile phone numbers
 * Format: 01 + operator code (22|27|28|20|00|06|09|01|11|14|12|55) + 7 digits
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Egyptian mobile number
 */
export const validateEgyptianPhone = (phone) => {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/\s+/g, '');
  const egyptianMobileRegex = /^01(22|27|28|20|00|06|09|01|11|14|12|55)\d{7}$/;
  
  return egyptianMobileRegex.test(cleanPhone);
};

/**
 * Validates geographic coordinates
 * @param {Array} coordinates - [longitude, latitude] array (GeoJSON format)
 * @returns {Object} Validation result with isValid flag and optional error message
 */
export const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return {
      isValid: false,
      error: 'Coordinates must be an array of [longitude, latitude]'
    };
  }

  const [longitude, latitude] = coordinates;

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return {
      isValid: false,
      error: 'Coordinates must be numbers'
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      error: 'Longitude must be between -180 and 180'
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      isValid: false,
      error: 'Latitude must be between -90 and 90'
    };
  }

  return { isValid: true };
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {Object} Validation result with isValid flag and optional error message
 */
export const validateUrl = (url) => {
  if (!url) return { isValid: true };
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Validates file uploads for size and type constraints
 * @param {File} file - File object to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @param {Array} options.allowedTypes - Allowed MIME types
 * @returns {Object} Validation result with isValid flag and optional error message
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  } = options;

  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Validates product image uploads
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result
 */
export const validateProductImage = (file) => {
  return validateFile(file, {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  });
};

/**
 * Returns product image upload constraints for UI display
 * @returns {Object} Image constraints configuration
 */
export const getProductImageConstraints = () => ({
  maxSize: 5 * 1024 * 1024,
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  recommendedDimensions: {
    width: 800,
    height: 600,
    aspectRatio: '4:3'
  }
});
