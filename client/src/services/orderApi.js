import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Get all orders for the logged-in user (farmer or customer)
 * GET /api/orders/myorders
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status: "Incoming", "Ready for Delivery", "Completed", "Cancelled"
 * @param {string} params.search - Search term
 * @returns {Promise<Object>} Paginated response { data: [], page, pages, total }
 */
export const getMyOrders = async (params = {}) => {
  try {
    // Build query params object with only valid query parameters
    const queryParams = {};

    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.status) queryParams.status = params.status;
    if (params.search) queryParams.search = params.search;

    const { data } = await apiClient.get(API_ENDPOINTS.orders.myOrders, {
      params: queryParams,
    });
    // Return the full pagination object from server
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Get count of incoming orders (status: "Incoming")
 * GET /api/orders/count/incoming
 * @returns {Promise<number>} Count of incoming orders
 */
export const getIncomingOrdersCount = async () => {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.orders.incomingCount);
    return data.count || 0;
  } catch (error) {
    console.error("Error fetching incoming orders count:", error);
    return 0; // Don't throw, just return 0 for the navbar badge
  }
};

/**
 * Update the status of a specific order
 * PUT /api/orders/:id/status
 * @param {string} orderId - The ID of the order to update
 * @param {string} status - The new status ("Completed" or "Cancelled")
 * @returns {Promise<Object>} The updated order object
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!["Completed", "Cancelled", "Ready for Delivery", "Incoming"].includes(status)) {
    console.error("Invalid status for update.");
    throw new Error("Invalid status for update.");
  }

  try {
    const { data } = await apiClient.put(API_ENDPOINTS.orders.updateStatus(orderId), { status });
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error; // Re-throw for the component to handle
  }
};

export default {
  getMyOrders,
  getIncomingOrdersCount,
  updateOrderStatus,
};
