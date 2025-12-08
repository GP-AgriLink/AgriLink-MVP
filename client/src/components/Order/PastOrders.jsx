import { memo, useMemo } from "react";
import OrderSearchBar from "./OrderSearchBar";
import { TableSkeleton } from "./Skeletons";
import { useOrders } from "../../context/OrdersContext";
import { getFilterLabel } from "../../utils/orderStatusLabels";

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

  // Get dynamic label based on user role
  const pageTitle = getFilterLabel(activeFilter, userRole) + " Orders";
  const description =
    activeFilter === "completed"
      ? "Review your completed deliveries for reference."
      : "Here you can review your cancelled orders.";

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
          <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">{pageTitle}</h2>
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
        <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">{pageTitle}</h2>

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
      <p className="animate-fade-in text-left text-sm text-gray-500">{description}</p>

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
          // Enhanced Empty state with animations
          <div
            className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center"
            style={{ animation: "fadeInScale 0.6s ease-out" }}
          >
            {/* Animated container with gradient border */}
            <div className="group relative max-w-lg">
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 animate-pulse rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-30 blur-sm transition-opacity duration-300 group-hover:opacity-50" />

              {/* Content container */}
              <div className="relative rounded-3xl bg-white p-8 shadow-xl">
                {/* Image with float animation */}
                <div className="relative mb-6">
                  <img
                    src="/noOrder_4.svg"
                    alt="No orders"
                    className="mx-auto h-64 w-64 object-contain transition-transform duration-500 group-hover:scale-105"
                    style={{ animation: "float 3s ease-in-out infinite" }}
                  />

                  {/* Sparkle decorations - imported at top */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-1/4 top-4 h-6 w-6 animate-pulse text-emerald-400 opacity-70"
                  >
                    <path d="M12 3v18M3 12h18" />
                    <path d="m16 16 4 4M8 8 4 4M16 8l4-4M8 16l-4 4" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute right-1/4 top-12 h-5 w-5 animate-pulse text-teal-400 opacity-50"
                    style={{ animationDelay: "150ms" }}
                  >
                    <path d="M12 3v18M3 12h18" />
                    <path d="m16 16 4 4M8 8 4 4M16 8l4-4M8 16l-4 4" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute bottom-8 left-1/3 h-4 w-4 animate-pulse text-emerald-300 opacity-60"
                    style={{ animationDelay: "300ms" }}
                  >
                    <path d="M12 3v18M3 12h18" />
                    <path d="m16 16 4 4M8 8 4 4M16 8l4-4M8 16l-4 4" />
                  </svg>
                </div>

                {/* Title with gradient */}
                <h2 className="mb-3 bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-3xl font-bold text-transparent">
                  {activeSearch ? "No Results Found" : "No Orders Yet"}
                </h2>

                {/* Message */}
                <p className="leading-relaxed text-gray-600">
                  {activeSearch
                    ? `No orders found for "${activeSearch}". Try a different search term.`
                    : "Orders matching your criteria will appear here"}
                </p>
              </div>
            </div>

            <style>{`
              @keyframes fadeInScale {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
            `}</style>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-gradient-to-t from-white to-white/0"></div>
      </div>
    </section>
  );
});

PastOrders.displayName = "PastOrders";

export default PastOrders;
