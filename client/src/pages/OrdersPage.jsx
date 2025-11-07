import { useState, useEffect } from "react";
import { getMyOrders, updateOrderStatus } from "../services/orderApi";
import { useAuth } from "../context/AuthContext";
import IncomingOrders from "../components/Order/IncomingOrders";
import PastOrders from "../components/Order/PastOrders";
import { toast } from "react-toastify";
import noOrderImage from "/noOrder_4.svg";

const OrdersPage = ({ activeFilter = "incoming" }) => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchAndSetOrderCount } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersArray = await getMyOrders();
      if (Array.isArray(ordersArray)) {
        const incoming = ordersArray.filter(
          (o) => o.status === "Incoming" || o.status === "Ready for Delivery"
        );
        const past = ordersArray.filter(
          (o) => o.status === "Completed" || o.status === "Cancelled"
        );

        setIncomingOrders(
          incoming.map((o) => ({
            id: o._id,
            customer: o.customerName,
            phone: o.customerPhone || "N/A",
            total: o.totalAmount,
            items: o.orderItems.map((i) => ({
              name: i.name,
              qty: i.quantity,
              price: i.unitPrice,
            })),
            status: o.status,
            date: o.createdAt,
          }))
        );

        setPastOrders(
          past.map((o) => ({
            id: o._id,
            customer: o.customerName,
            total: o.totalAmount,
            status: o.status,
            date: o.updatedAt || o.createdAt,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOrderUpdate = async (id, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`, { autoClose: 2000 });
      await fetchOrders();
      await fetchAndSetOrderCount();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!loading && incomingOrders.length === 0 && pastOrders.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
        <img src={noOrderImage} alt="No orders" className="mb-4 h-64 w-64" />
        <h2 className="text-2xl font-semibold text-gray-700">No Orders Yet</h2>
        <p className="text-gray-500">When you get a new order, it will appear here.</p>
      </div>
    );
  }

  // Conditionally render based on the activeFilter
  const showIncoming = activeFilter === "incoming" || activeFilter === "delivery";
  const showPast = activeFilter === "completed" || activeFilter === "cancelled";

  return (
    <div className="min-h-screen px-4 py-2 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12">
        {showIncoming && (
          <IncomingOrders
            orders={incomingOrders}
            onOrderUpdate={handleOrderUpdate}
            activeFilter={activeFilter}
          />
        )}
        {showPast && <PastOrders orders={pastOrders} activeFilter={activeFilter} />}
      </div>
    </div>
  );
};

export default OrdersPage;
