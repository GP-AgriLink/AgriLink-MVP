import apiClient from "../config/api";
import { getAuthToken } from "./authService";

/**
 * Get customer report. Backend endpoint: `/api/users/profile/report`.
 * Accepts query params such as `year` or `month` depending on backend.
 */
export const getCustomerReport = async (params = {}) => {
  try {
    // Debugging: log params and current token to ensure request is formed correctly
    try {
      const token = getAuthToken();
      console.debug("getCustomerReport params:", params, "token present:", !!token);
    } catch (e) {
      console.debug("getCustomerReport: failed to read token", e);
    }

    const response = await apiClient.get("/api/users/profile/report", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer report:", error);
    throw error;
  }
};

export default { getCustomerReport };
