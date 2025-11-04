import apiClient from "../config/api";
import { toast } from "react-toastify";

/**
 * Submits a new order to the backend.
 * Corresponds to SRS FR-5.3 [cite: 69]
 * @param {object} orderData - The order payload
 * @returns {Promise<object>} The created order object
 */
export const submitOrder = async (orderData) => {
  try {
    const response = await apiClient.post("/api/orders", orderData);
    return response.data;
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error submitting order:", error);
    console.error("Error response:", JSON.stringify(error.response?.data, null, 2));
    console.error("Error status:", error.response?.status);
    console.error("Order data sent:", JSON.stringify(orderData, null, 2));
    throw error;
  }
};