import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Get all orders for the logged-in farmer
 * GET /api/orders/myorders
 * @returns {Promise<Array>} A list of the farmer's orders
 */
export const getMyOrders = async () => {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.orders.myOrders);
    return data || []; // Ensure an array is always returned
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    throw error; // Re-throw for the component to handle (e.g., setLoading)
  }
};

/**
 * Get count of incoming orders (status: "Incoming")
 * GET /api/orders/count/incoming
 * @returns {Promise<number>} Count of incoming orders
 */
export const getIncomingOrdersCount = async () => {
  try {
    const { data } = await apiClient.get(
      API_ENDPOINTS.orders.incomingCount
    );
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
    const { data } = await apiClient.put(
      API_ENDPOINTS.orders.updateStatus(orderId),
      { status }
    );
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