/**
 * Handles all file uploads for the application.
 * Replaces old (profileApi) and (farmProductApi) upload functions.
 */
import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Upload an image file.
 * @param {File} file - The image file to upload
 * @returns {Promise<object>} Response containing the secure { imageUrl }
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(API_ENDPOINTS.uploads.uploadImage, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { message, imageUrl }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to upload image";
    throw new Error(errorMessage);
  }
};

export default {
  uploadImage,
};
