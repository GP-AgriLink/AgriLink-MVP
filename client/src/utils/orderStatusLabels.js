/**
 * Get user-friendly label for order status
 * Customers see: "Pending", "Pickup", "Completed", "Cancelled"
 * Farmers see: "Incoming", "Delivery", "Completed", "Cancelled"
 *
 * @param {string} status - Backend status value
 * @param {string} userRole - "customer" or "farmer"
 * @returns {string} Display label
 */
export const getStatusLabel = (status, userRole) => {
  if (userRole === "customer") {
    const customerLabels = {
      Incoming: "Pending",
      "Ready for Delivery": "Pickup",
      Completed: "Completed",
      Cancelled: "Cancelled",
    };
    return customerLabels[status] || status;
  }

  // Farmers see different labels
  if (userRole === "farmer") {
    const farmerLabels = {
      Incoming: "Incoming",
      "Ready for Delivery": "Delivery",
      Completed: "Completed",
      Cancelled: "Cancelled",
    };
    return farmerLabels[status] || status;
  }

  return status;
};

/**
 * Get user-friendly label for filter/tab names
 * @param {string} filter - Filter name ("incoming", "delivery", "completed", "cancelled")
 * @param {string} userRole - "customer" or "farmer"
 * @returns {string} Display label
 */
export const getFilterLabel = (filter, userRole) => {
  if (userRole === "customer") {
    const labels = {
      incoming: "Pending",
      delivery: "Pickup",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[filter] || filter;
  }

  // Farmers see different labels
  const labels = {
    incoming: "Incoming",
    delivery: "Delivery",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[filter] || filter;
};
