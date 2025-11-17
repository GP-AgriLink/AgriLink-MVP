import { CheckCircle, Truck, Inbox, XCircle } from "lucide-react";

/**
 * OrderStats
 * Displays clickable stat boxes for order categories
 * @param {Object} orderStats - Object with counts for each status
 * @param {string} activeFilter - The currently selected filter
 * @param {Function} onStatClick - Handler to change the filter
 */
const OrderStats = ({ orderStats, activeFilter, onStatClick }) => {
  const stats = {
    incoming: orderStats?.Incoming || 0,
    delivery: orderStats?.["Ready for Delivery"] || 0,
    completed: orderStats?.Completed || 0,
    cancelled: orderStats?.Cancelled || 0,
  };

  const statItems = [
    {
      id: "incoming",
      label: "Incoming",
      count: stats.incoming,
      color: "blue",
      icon: Inbox,
      bgColor: "bg-blue-600",
    },
    {
      id: "delivery",
      label: "Delivery",
      count: stats.delivery,
      color: "orange",
      icon: Truck,
      bgColor: "bg-orange-500",
    },
    {
      id: "completed",
      label: "Completed",
      count: stats.completed,
      color: "emerald",
      icon: CheckCircle,
      bgColor: "bg-emerald-600",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: stats.cancelled,
      color: "gray",
      icon: XCircle,
      bgColor: "bg-gray-500",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onStatClick(item.id)}
          className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            activeFilter === item.id ? `border-${item.color}-300` : "border-gray-100"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start">
              <span className={`text-3xl font-bold text-gray-800`}>{item.count}</span>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">
                {item.label} Orders
              </span>
            </div>
            <div
              className={`rounded-full p-3 bg-${item.color}-100 transition-colors group-hover:bg-${item.color}-600`}
            >
              <item.icon
                className={`h-6 w-6 text-${item.color}-600 transition-colors group-hover:text-white`}
              />
            </div>
          </div>
          <div
            className={`absolute bottom-0 left-0 h-1.5 w-full ${
              item.bgColor
            } origin-left transform transition-transform duration-300 ease-in-out ${
              activeFilter === item.id ? "scale-x-100" : "scale-x-0"
            } group-hover:scale-x-100`}
          />
        </button>
      ))}
    </div>
  );
};

export default OrderStats;
