import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Upload an image file with progress tracking
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<object>} Response containing the secure { imageUrl }
 */
export const uploadImage = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(API_ENDPOINTS.uploads.uploadImage, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data; // { message, imageUrl }
  } catch (error) {
    // --- ERROR MESSAGE ---
    const errorMessage = error.response?.data?.message || "Image upload failed. Please try again.";
    throw new Error(errorMessage);
  }
};

export default {
  uploadImage,
};
