import { memo } from "react";
import OrderCard from "./OrderCard";
import { OrdersGridSkeleton } from "./Skeletons";
import OrderSearchBar from "./OrderSearchBar";
import { useOrders } from "../../context/OrdersContext";

const IncomingOrders = memo(({ orders, onOrderUpdate, activeFilter, userRole, isLoading }) => {
  const { activeSearch, searchLoading } = useOrders();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">
            {activeFilter === "incoming" ? "Incoming Orders" : "Delivery Orders"}
          </h2>
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
        <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">
          {activeFilter === "incoming" ? "Incoming Orders" : "Delivery Orders"}
        </h2>

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
        <div className="animate-fade-in flex flex-col items-center justify-center py-10 text-center">
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
    </section>
  );
});

IncomingOrders.displayName = "IncomingOrders";

export default IncomingOrders;
