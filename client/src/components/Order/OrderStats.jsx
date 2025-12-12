import { memo } from "react";
import { ShoppingBag, Truck, CheckCircle2, XCircle } from "lucide-react";
import { getFilterLabel } from "../../utils/orderStatusLabels";

/**
 * OrderStats - Compact unified design
 * Displays premium stat cards with consistent sizing across all stats components
 */
const OrderStats = memo(({ orderStats, activeFilter, onStatClick, userRole }) => {
  const stats = {
    incoming: orderStats?.Incoming || 0,
    delivery: orderStats?.["Ready for Delivery"] || 0,
    completed: orderStats?.Completed || 0,
    cancelled: orderStats?.Cancelled || 0,
  };

  const statItems = [
    {
      id: "incoming",
      label: getFilterLabel("incoming", userRole),
      count: stats.incoming,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      activeRing: "ring-blue-500/20",
      activeShadow: "shadow-blue-500/10",
    },
    {
      id: "delivery",
      label: getFilterLabel("delivery", userRole),
      count: stats.delivery,
      icon: Truck,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      activeRing: "ring-amber-500/20",
      activeShadow: "shadow-amber-500/10",
    },
    {
      id: "completed",
      label: getFilterLabel("completed", userRole),
      count: stats.completed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      activeRing: "ring-emerald-500/20",
      activeShadow: "shadow-emerald-500/10",
    },
    {
      id: "cancelled",
      label: getFilterLabel("cancelled", userRole),
      count: stats.cancelled,
      icon: XCircle,
      gradient: "from-gray-500 to-slate-700",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      activeRing: "ring-gray-500/20",
      activeShadow: "shadow-gray-500/10",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onStatClick(item.id)}
            className={`group relative overflow-hidden rounded-xl border bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
              isActive
                ? `border-transparent shadow-lg ring-2 ${item.activeRing} ${item.activeShadow}`
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-label={`View ${item.label} orders`}
            aria-pressed={isActive}
          >
            {/* Content - Horizontal layout for compact design */}
            <div className="relative flex items-center gap-3">
              {/* Icon */}
              <div
                className={`flex-shrink-0 rounded-lg p-2 transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-br ${item.gradient}`
                    : `${item.iconBg} group-hover:scale-105`
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-white" : item.iconColor}`}
                  strokeWidth={2}
                />
              </div>

              {/* Stats */}
              <div className="flex flex-col items-start">
                <span className="text-2xl font-bold text-gray-800">{item.count}</span>
                <span className="text-xs font-medium text-gray-500">{item.label}</span>
              </div>
            </div>

            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${item.gradient} transition-all duration-300 ${
                  isActive ? "translate-x-0" : "-translate-x-full group-hover:translate-x-0"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
});

OrderStats.displayName = "OrderStats";

export default OrderStats;
