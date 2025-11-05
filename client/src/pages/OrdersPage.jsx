import { useState, useEffect } from 'react';
import { getMyOrders, updateOrderStatus } from '../services/orderApi';
import { useAuth } from '../context/AuthContext';
import IncomingOrders from '../components/Order/IncomingOrders';
import PastOrders from '../components/Order/PastOrders';
import { toast } from 'react-toastify';
import noOrderImage from '/noOrder_4.svg';

const OrdersPage = () => {
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

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