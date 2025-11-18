import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getMyOrders, updateOrderStatus } from "../services/orderApi";
import { getDashboardStats } from "../services/farmApi";
import { useAuth } from "../context/AuthContext";
import IncomingOrders from "../components/Order/IncomingOrders";
import PastOrders from "../components/Order/PastOrders";
import OrderStats from "../components/Order/OrderStats";
import LogoSpinner from "../components/common/LogoSpinner";
import { toast } from "react-toastify";
import noOrderImage from "/noOrder_4.svg";

const isFarmer = (user) => user?.role === "farmer";
const isCustomer = (user) => user?.role === "customer";

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeFilter = searchParams.get("filter") || "incoming";
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [loading, setLoading] = useState(true);
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
        const allOrders = await getMyOrders();
        const statsCalculated = {
          Incoming: allOrders.filter((o) => o.status === "Incoming").length,
          "Ready for Delivery": allOrders.filter((o) => o.status === "Ready for Delivery").length,
          Completed: allOrders.filter((o) => o.status === "Completed").length,
          Cancelled: allOrders.filter((o) => o.status === "Cancelled").length,
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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Get the actual status value from the filter
      const statusValue = getStatusFromFilter(activeFilter);

      // Fetch orders filtered by status from the backend
      const ordersArray = await getMyOrders({ status: statusValue });

      if (Array.isArray(ordersArray)) {
        // Transform orders to the format expected by the UI
        const transformedOrders = ordersArray.map((o) => ({
          id: o._id,
          customer: o.user?.firstName ? `${o.user.firstName} ${o.user.lastName}` : "Customer",
          phone: o.user?.phone || "N/A",
          total: o.totalAmount,
          items:
            o.orderItems?.map((i) => ({
              name: i.name,
              qty: i.quantity,
              price: i.unitPrice,
            })) || [],
          status: o.status,
          date:
            activeFilter === "completed" || activeFilter === "cancelled"
              ? o.updatedAt
              : o.createdAt,
        }));

        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, getStatusFromFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdate = useCallback(async (id, newStatus) => {
    if (!isFarmer(user)) {
      toast.error("Only farmers can update order status");
      return;
    }

    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`, { autoClose: 2000 });
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (err) {
      console.error("Error updating order status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update order status";
      toast.error(errorMessage);
    }
  }, [user, fetchOrders, fetchStats]);

  const handleFilterClick = useCallback((filter) => {
    navigate(`/dashboard/orders?filter=${filter}`);
  }, [navigate]);

  // Memoize empty state message based on user role
  const emptyMessage = useMemo(() => 
    isFarmer(user) 
      ? "When you receive a new order, it will appear here."
      : "You haven't placed any orders yet. Start shopping to see your orders here!",
    [user]
  );

  const renderEmptyState = useCallback(() => (
    <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
      <img src={noOrderImage} alt="No orders" className="mb-4 h-64 w-64" />
      <h2 className="text-2xl font-semibold text-gray-700">No Orders Yet</h2>
      <p className="text-gray-500">{emptyMessage}</p>
    </div>
  ), [emptyMessage]);

  if (loading && statsLoading) {
    return <LogoSpinner message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 md:px-12 lg:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12">
        <OrderStats
          orderStats={orderStats}
          activeFilter={activeFilter}
          onStatClick={handleFilterClick}
        />

        {orders.length > 0 && !loading ? (
          <>
            {(activeFilter === "incoming" || activeFilter === "delivery") && (
              <IncomingOrders
                orders={orders}
                onOrderUpdate={handleOrderUpdate}
                activeFilter={activeFilter}
                userRole={user?.role}
              />
            )}

            {(activeFilter === "completed" || activeFilter === "cancelled") && (
              <PastOrders orders={orders} activeFilter={activeFilter} />
            )}
          </>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
