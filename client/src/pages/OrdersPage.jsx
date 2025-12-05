import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { updateOrderStatus } from "../services/orderApi";
import { getDashboardStats } from "../services/farmApi";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import IncomingOrders from "../components/Order/IncomingOrders";
import PastOrders from "../components/Order/PastOrders";
import OrderStats from "../components/Order/OrderStats";
import LogoSpinner from "../components/common/LogoSpinner";
import { OrderPageSkeleton } from "../components/Order/Skeletons";
import { toast } from "react-toastify";
import noOrderImage from "/noOrder_4.svg";

const isFarmer = (user) => user?.role === "farmer";
const isCustomer = (user) => user?.role === "customer";

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeFilter = searchParams.get("filter") || "incoming";

  // Use OrdersContext for orders data
  const {
    orders: ordersData,
    loading,
    refreshOrders,
    setStatusFilter,
    activeStatus,
    activeSearch,
    totalOrders,
    page,
    totalPages,
    goToPage,
  } = useOrders();

  const [orderStats, setOrderStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  // Memoize status mapping to avoid recreation on every render
  const getStatusFromFilter = useCallback((filter) => {
    const statusMap = {
      incoming: "Incoming",
      delivery: "Ready for Delivery",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[filter] || "Incoming";
  }, []);

  // Memoize fetchStats to maintain stable reference
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      if (isFarmer(user)) {
        const stats = await getDashboardStats();
        setOrderStats(stats.orders || {});
      } else if (isCustomer(user)) {
        // For customers, we need to fetch all orders (no pagination) to calculate stats
        const { getMyOrders } = await import("../services/orderApi");
        const allOrders = await getMyOrders();
        const ordersArray = Array.isArray(allOrders) ? allOrders : allOrders.data || [];
        const statsCalculated = {
          Incoming: ordersArray.filter((o) => o.status === "Incoming").length,
          "Ready for Delivery": ordersArray.filter((o) => o.status === "Ready for Delivery").length,
          Completed: ordersArray.filter((o) => o.status === "Completed").length,
          Cancelled: ordersArray.filter((o) => o.status === "Cancelled").length,
        };
        setOrderStats(statsCalculated);
      }
    } catch (statsError) {
      console.error("Failed to load order stats", statsError);
      setOrderStats({
        Incoming: 0,
        "Ready for Delivery": 0,
        Completed: 0,
        Cancelled: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Initialize status from URL on mount only
  useEffect(() => {
    const statusValue = getStatusFromFilter(activeFilter);
    setStatusFilter(statusValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Transform orders from context to UI format
  const orders = useMemo(() => {
    if (!ordersData || !Array.isArray(ordersData)) return [];

    return ordersData.map((o) => {
      // Role-based data extraction
      const displayName = isCustomer(user)
        ? o.farm?.farmName || "Unknown Farm"
        : o.user?.firstName
          ? `${o.user.firstName} ${o.user.lastName}`
          : "Unknown Customer";

      const contactInfo = isCustomer(user) ? o.user?.phone || "N/A" : o.user?.phone || "N/A";

      return {
        id: o._id,
        displayName,
        contactInfo,
        avatarUrl: o.farm?.avatarUrl || o.farm?.user?.avatarUrl || null,
        farmLocation: o.farm?.location?.coordinates || null,
        email: o.user?.email,
        total: o.totalAmount,
        items:
          o.orderItems?.map((i) => ({
            name: i.name,
            qty: i.quantity,
            price: i.unitPrice,
          })) || [],
        status: o.status,
        date:
          activeFilter === "completed" || activeFilter === "cancelled" ? o.updatedAt : o.createdAt,
      };
    });
  }, [ordersData, user, activeFilter]);

  const handleOrderUpdate = useCallback(
    async (id, newStatus) => {
      if (!isFarmer(user)) {
        toast.error("Only farmers can update order status");
        return;
      }

      try {
        await updateOrderStatus(id, newStatus);
        toast.success(`Order marked as ${newStatus}`, { autoClose: 2000 });
        await Promise.all([refreshOrders(), fetchStats()]);
      } catch (err) {
        console.error("Error updating order status:", err);
        const errorMessage = err.response?.data?.message || "Failed to update order status";
        toast.error(errorMessage);
      }
    },
    [user, refreshOrders, fetchStats]
  );

  const handleFilterClick = useCallback(
    (filter) => {
      navigate(`/dashboard/orders?filter=${filter}`);
      // Also update context status directly
      const statusValue = getStatusFromFilter(filter);
      setStatusFilter(statusValue);
    },
    [navigate, setStatusFilter]
  );

  // Memoize empty state message based on user role and search state
  const emptyMessage = useMemo(() => {
    if (activeSearch) {
      return `No orders found for "${activeSearch}". Try adjusting your search.`;
    }
    return isFarmer(user)
      ? "When you receive a new order, it will appear here."
      : "You haven't placed any orders yet. Start shopping to see your orders here!";
  }, [user, activeSearch]);

  const renderEmptyState = useCallback(
    () => (
      <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
        <img src={noOrderImage} alt="No orders" className="mb-4 h-64 w-64" />
        <h2 className="text-2xl font-semibold text-gray-700">
          {activeSearch ? "No Results Found" : "No Orders Yet"}
        </h2>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    ),
    [emptyMessage, activeSearch]
  );

  // Enhanced skeleton for initial load
  if (loading && statsLoading) {
    return <OrderPageSkeleton />;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 md:px-12 lg:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8">
        <OrderStats
          orderStats={orderStats}
          activeFilter={activeFilter}
          onStatClick={handleFilterClick}
        />

        {/* Always render child components - they handle their own empty states */}
        {!loading ? (
          <>
            {(activeFilter === "incoming" || activeFilter === "delivery") && (
              <IncomingOrders
                orders={orders}
                onOrderUpdate={handleOrderUpdate}
                activeFilter={activeFilter}
                userRole={user?.role}
                isLoading={loading}
              />
            )}

            {(activeFilter === "completed" || activeFilter === "cancelled") && (
              <PastOrders
                orders={orders}
                activeFilter={activeFilter}
                userRole={user?.role}
                isLoading={loading}
              />
            )}

            {/* Enhanced Pagination - only show when there are results and multiple pages */}
            {orders.length > 0 && totalPages > 1 && (
              <div className="animate-fade-in flex flex-wrap items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx + 1)}
                      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 ${
                        page === idx + 1
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md ring-2 ring-emerald-200"
                          : "border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-emerald-300 hover:bg-gray-50"
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                      aria-current={page === idx + 1 ? "page" : undefined}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : null}

        {/* Only show page-level empty state when truly no orders exist (not from search) */}
        {!loading && totalOrders === 0 && !activeSearch && renderEmptyState()}
      </div>
    </div>
  );
};

export default OrdersPage;
