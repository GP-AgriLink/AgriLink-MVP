import { useState } from "react";

/**
 * PastOrders
 * Displays a table of completed or cancelled orders.
 * @param {Array} orders - List of full order objects
 * @param {string} activeFilter - The current active tab ("completed" or "cancelled")
 */
const PastOrders = ({ orders, activeFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter orders by search term
  const filteredOrders = orders.filter((order) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      order.customer?.toLowerCase().includes(lowerTerm)
    );
  });

  // Format date safely
  const formatDate = (order) => {
    const dateStr = order.date;
    if (!dateStr) return "Unknown Date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Unknown Date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Unknown Date";
    }
  };

  return (
    <section className="space-y-6 relative">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold text-gray-800">
          {activeFilter === "completed"
            ? "Completed Orders"
            : "Cancelled Orders"}
        </h2>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          {/* Status Counter */}
          {activeFilter === "completed" && (
            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
              {filteredOrders.filter((o) => o.status === "Completed").length} Completed
            </span>
          )}
          {activeFilter === "cancelled" && (
            <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium">
              {filteredOrders.filter((o) => o.status === "Cancelled").length} Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-left text-sm">
        {activeFilter === "completed"
          ? "Review your completed deliveries for reference."
          : "Here you can review your cancelled orders."}
      </p>

      {/* Table Section */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-b from-white to-white/0 z-10"></div>

        {filteredOrders.length > 0 ? (
          <div className="bg-white shadow-lg rounded-2xl border border-green-100 overflow-y-auto max-h-[750px] scroll-smooth custom-scrollbar">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-green-100 text-gray-600 uppercase text-xs tracking-wide sticky top-0 z-20">
                <tr>
                  <th className="py-4 px-6 text-center">Order ID</th>
                  <th className="py-4 px-6 text-center">Customer</th>
                  <th className="py-4 px-6 text-center">Total</th>
                  <th className="py-4 px-6 text-center">Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`border-t hover:bg-green-50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                  >
                    <td className="py-4 px-6 font-medium">#{order.id.slice(-6)}</td>
                    <td className="py-4 px-6">{order.customer}</td>
                    <td className="py-4 px-6">${order.total.toFixed(2)}</td>
                    <td className="py-4 px-6">{formatDate(order)}</td>
                    <td
                      className={`py-4 px-6 font-semibold ${order.status === "Completed"
                        ? "text-green-600"
                        : "text-red-900"
                        }`}
                    >
                      {order.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Empty state when no search results
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-emerald-50 p-8 rounded-xl shadow-sm w-full max-w-md">
              <img
                src="/noOrder_4.svg"
                alt="No orders"
                className="w-[280px] sm:w-[350px] mx-auto opacity-90 object-contain"
              />
              <p className="text-lg font-semibold text-emerald-700 mt-4">
                No Orders Found.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try a different name or phone number.
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-t from-white to-white/0 z-10"></div>
      </div>
    </section>
  );
};

export default PastOrders;
