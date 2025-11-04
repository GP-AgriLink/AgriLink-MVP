import { useState, useEffect } from "react";
import { getMyOrders, updateOrderStatus } from "../services/orderApi";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import IncomingOrders from "../components/Order/IncomingOrders";
import PastOrders from "../components/Order/PastOrders";
import { toast } from "react-toastify";
import noOrderImage from "/noOrder_4.svg"; // Ensure this path is correct

const OrdersPage = () => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchAndSetOrderCount } = useAuth(); // Get the context function

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersArray = await getMyOrders(); // Uses service

      if (Array.isArray(ordersArray)) {
        // Filter based on valid server statuses
        const incoming = ordersArray.filter(
          (o) => o.status === "Incoming" || o.status === "Ready for Delivery"
        );
        const past = ordersArray.filter(
          (o) => o.status === "Completed" || o.status === "Cancelled"
        );

        // Transform data for the new OrderCard component
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
            data: o, // Include original data if needed
          }))
        );

        setPastOrders(
          past.map((o) => ({
            id: o._id,
            customer: o.customerName,
            total: o.totalAmount,
            status: o.status,
            date: o.updatedAt || o.createdAt,
            data: o,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      // Error is already toasted by the interceptor
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

      if (newStatus === "Completed" || newStatus === "Cancelled") {
        setIncomingOrders((prev) => prev.filter((o) => o.id !== id));
        // Add the formatted order to pastOrders
        setPastOrders((prev) => [
          {
            id: updatedOrder._id,
            customer: updatedOrder.customerName,
            total: updatedOrder.totalAmount,
            status: updatedOrder.status,
            date: updatedOrder.updatedAt || updatedOrder.createdAt,
            data: updatedOrder,
          },
          ...prev,
        ]);
        toast.success(`Order marked as ${newStatus}`);
        fetchAndSetOrderCount();
      } else if (newStatus === "Ready for Delivery") {
        // Update the status for the item in the incoming list
        setIncomingOrders((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: "Ready for Delivery" } : o
          )
        );
        toast.success(`Order marked as Ready for Delivery`);
        // Refresh count since "Incoming" count will change
        fetchAndSetOrderCount();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      // Error is toasted by the interceptor
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no orders are found
  if (!loading && incomingOrders.length === 0 && pastOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <img src={noOrderImage} alt="No orders" className="w-64 h-64 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">No Orders Yet</h2>
        <p className="text-gray-500">
          When you get a new order, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8 3xl:px-8 py-2">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-12">
        <IncomingOrders
          orders={incomingOrders}
          onOrderUpdate={handleOrderUpdate}
        />
        <PastOrders orders={pastOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;