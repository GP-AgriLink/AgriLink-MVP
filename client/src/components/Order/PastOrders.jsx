import { memo, useMemo } from "react";
import OrderSearchBar from "./OrderSearchBar";
import { TableSkeleton } from "./Skeletons";
import { useOrders } from "../../context/OrdersContext";

/**
 * Format date safely - utility function outside component to avoid recreation
 */
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

/**
 * PastOrders
 * Displays a table of completed or cancelled orders.
 * @param {Array} orders - List of full order objects
 * @param {string} activeFilter - The current active tab ("completed" or "cancelled")
 * @param {boolean} isLoading - Loading state
 */
const PastOrders = memo(({ orders, activeFilter, userRole, isLoading }) => {
  const { activeSearch, searchLoading } = useOrders();

  // Memoize filtered counts to avoid re-filtering on every render
  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "Completed").length,
    [orders]
  );

  const cancelledCount = useMemo(
    () => orders.filter((o) => o.status === "Cancelled").length,
    [orders]
  );

  if (isLoading) {
    return (
      <section className="relative space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">
            {activeFilter === "completed" ? "Completed Orders" : "Cancelled Orders"}
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
        <TableSkeleton />
      </section>
    );
  }

  return (
    <section className="relative space-y-6">
      {/* Header with Search and Counter */}
      <div className="animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">
          {activeFilter === "completed" ? "Completed Orders" : "Cancelled Orders"}
        </h2>

        {/* Search + Status Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <OrderSearchBar />
          {searchLoading ? (
            <span className="animate-pulse rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-3.5 py-1.5 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
              Searching...
            </span>
          ) : (
            <>
              {activeFilter === "completed" && (
                <span className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-3.5 py-1.5 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-green-200">
                  {activeSearch ? `${completedCount} Found` : `${completedCount} Completed`}
                </span>
              )}
              {activeFilter === "cancelled" && (
                <span className="rounded-full bg-gradient-to-r from-red-100 to-rose-100 px-3.5 py-1.5 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200">
                  {activeSearch ? `${cancelledCount} Found` : `${cancelledCount} Cancelled`}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="animate-fade-in text-left text-sm text-gray-500">
        {activeFilter === "completed"
          ? "Review your completed deliveries for reference."
          : "Here you can review your cancelled orders."}
      </p>

      {/* Table Section */}
      <div className="animate-fade-in relative">
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-6 bg-gradient-to-b from-white to-white/0"></div>

        {orders.length > 0 ? (
          <div className="custom-scrollbar max-h-[750px] overflow-y-auto scroll-smooth rounded-2xl border border-green-100 bg-white shadow-lg">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="sticky top-0 z-20 bg-green-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-6 py-4 text-start">Order ID</th>
                  <th className="px-6 py-4 text-start">
                    {userRole === "farmer" ? "Customer" : "Farm"}
                  </th>
                  <th className="px-6 py-4 text-start">Total</th>
                  <th className="px-6 py-4 text-start">Date</th>
                  <th className="px-6 py-4 text-start">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`border-t transition hover:bg-green-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">#{order.id.slice(-6)}</td>
                    <td className="px-6 py-4">{order.displayName}</td>
                    <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">{formatDate(order)}</td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        order.status === "Completed" ? "text-green-600" : "text-red-900"
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
          // Empty state when no orders
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-full max-w-md rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-8 shadow-lg ring-1 ring-green-100">
              <img
                src="/noOrder_4.svg"
                alt="No orders"
                className="mx-auto w-[280px] object-contain opacity-90 drop-shadow-sm sm:w-[350px]"
              />
              <p className="mt-4 text-lg font-semibold text-emerald-700">
                {activeSearch ? "No Results Found" : "No Orders Yet"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {activeSearch
                  ? `No orders found for "${activeSearch}". Try a different search term.`
                  : "Orders matching your criteria will appear here"}
              </p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-gradient-to-t from-white to-white/0"></div>
      </div>
    </section>
  );
});

PastOrders.displayName = "PastOrders";

export default PastOrders;
