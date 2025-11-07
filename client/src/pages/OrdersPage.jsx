import { useState, useEffect } from "react";
import { getMyOrders, updateOrderStatus } from "../services/orderApi";
import { useAuth } from "../context/AuthContext";
import IncomingOrders from "../components/Order/IncomingOrders";
import PastOrders from "../components/Order/PastOrders";
import { toast } from "react-toastify";
import noOrderImage from "/noOrder_4.svg";

const OrdersPage = ({ activeFilter = "incoming" }) => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchAndSetOrderCount } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersArray = await getMyOrders();

      if (Array.isArray(ordersArray)) {
        const incoming = ordersArray.filter((o) => o.status === "Incoming");
        const delivery = ordersArray.filter((o) => o.status === "Ready for Delivery");
        const completed = ordersArray.filter((o) => o.status === "Completed");
        const cancelled = ordersArray.filter((o) => o.status === "Cancelled");

        // Incoming Orders
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

        // Delivery Orders
        setDeliveryOrders(
          delivery.map((o) => ({
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

        // Completed Orders
        setCompletedOrders(
          completed.map((o) => ({
            id: o._id,
            customer: o.customerName,
            total: o.totalAmount,
            status: o.status,
            date: o.updatedAt,
          }))
        );

        // Cancelled Orders
        setCancelledOrders(
          cancelled.map((o) => ({
            id: o._id,
            customer: o.customerName,
            total: o.totalAmount,
            status: o.status,
            date: o.updatedAt,
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

      setIncomingOrders((prev) => prev.filter((o) => o.id !== id));
      setDeliveryOrders((prev) => prev.filter((o) => o.id !== id));
      setCompletedOrders((prev) => prev.filter((o) => o.id !== id));
      setCancelledOrders((prev) => prev.filter((o) => o.id !== id));

      const newOrderObj = {
        id: updatedOrder._id,
        customer: updatedOrder.customerName,
        phone: updatedOrder.customerPhone || "N/A",
        total: updatedOrder.totalAmount,
        items: updatedOrder.orderItems?.map((i) => ({
          name: i.name,
          qty: i.quantity,
          price: i.unitPrice,
        })),
        status: updatedOrder.status,
        date: updatedOrder.updatedAt,
      };

      if (newStatus === "Incoming") setIncomingOrders((prev) => [...prev, newOrderObj]);
      if (newStatus === "Ready for Delivery") setDeliveryOrders((prev) => [...prev, newOrderObj]);
      if (newStatus === "Completed") setCompletedOrders((prev) => [...prev, newOrderObj]);
      if (newStatus === "Cancelled") setCancelledOrders((prev) => [...prev, newOrderObj]);

      await fetchAndSetOrderCount();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
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

  const renderEmptyState = () => (
    <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
      <img src={noOrderImage} alt="No orders" className="mb-4 h-64 w-64" />
      <h2 className="text-2xl font-semibold text-gray-700">No Orders Yet</h2>
      <p className="text-gray-500">When you get a new order, it will appear here.</p>
    </div>
  );

  const getOrdersToShow = () => {
    switch (activeFilter) {
      case "incoming":
        return incomingOrders;
      case "delivery":
        return deliveryOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return incomingOrders;
    }
  };

  const ordersToShow = getOrdersToShow();

  return (
    <div className="min-h-screen px-4 py-2 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12">
        {ordersToShow.length > 0 ? (
          <>
            {(activeFilter === "incoming" || activeFilter === "delivery") && (
              <IncomingOrders
                orders={ordersToShow}
                onOrderUpdate={handleOrderUpdate}
                activeFilter={activeFilter}
              />
            )}

            {(activeFilter === "completed" || activeFilter === "cancelled") && (
              <PastOrders
                orders={ordersToShow}
                activeFilter={activeFilter}
              />
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
