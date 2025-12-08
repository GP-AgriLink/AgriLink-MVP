import { memo } from "react";
import OrderCard from "./OrderCard";
import { OrdersGridSkeleton } from "./Skeletons";
import OrderSearchBar from "./OrderSearchBar";
import { useOrders } from "../../context/OrdersContext";
import { Sparkles } from "lucide-react";
import { getFilterLabel } from "../../utils/orderStatusLabels";

const IncomingOrders = memo(({ orders, onOrderUpdate, activeFilter, userRole, isLoading }) => {
  const { activeSearch, searchLoading } = useOrders();

  // Get dynamic label based on user role
  const pageTitle = getFilterLabel(activeFilter, userRole) + " Orders";
  const description =
    activeFilter === "incoming"
      ? "Manage your pending orders awaiting confirmation."
      : `Track orders that are currently ${userRole === "customer" ? "ready for pickup" : "being delivered"}.`;

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">{pageTitle}</h2>
          <div className="flex items-center gap-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
        <OrdersGridSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header with Search and Counter */}
      <div className="animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">{pageTitle}</h2>

        {/* Compact Search + Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <OrderSearchBar />
          {searchLoading ? (
            <span className="animate-pulse rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-3.5 py-1.5 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
              Searching...
            </span>
          ) : (
            <span className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-3.5 py-1.5 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-green-200">
              {activeSearch ? `${orders.length} Found` : `${orders.length} Active`}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="animate-fade-in text-left text-sm text-gray-500">{description}</p>

      {/* Orders Section */}
      {orders.length > 0 ? (
        <div className="animate-fade-in grid grid-cols-1 items-start justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-2 3xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOrderUpdate={onOrderUpdate}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
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

                {/* Sparkle decorations */}
                <Sparkles className="absolute left-1/4 top-4 h-6 w-6 animate-pulse text-emerald-400 opacity-70" />
                <Sparkles
                  className="absolute right-1/4 top-12 h-5 w-5 animate-pulse text-teal-400 opacity-50 delay-150"
                  style={{ animationDelay: "150ms" }}
                />
                <Sparkles
                  className="absolute bottom-8 left-1/3 h-4 w-4 animate-pulse text-emerald-300 opacity-60 delay-300"
                  style={{ animationDelay: "300ms" }}
                />
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
    </section>
  );
});

IncomingOrders.displayName = "IncomingOrders";

export default IncomingOrders;
