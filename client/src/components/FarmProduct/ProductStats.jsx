import { useMemo } from "react";
import { CheckCircle, Archive, AlertTriangle } from "lucide-react";

/**
 * ProductStats
 * Displays clickable stat boxes for product categories
 * @param {Array} products - Complete list of products
 * @param {string} activeFilter - The currently selected filter
 * @param {Function} onStatClick - Handler to navigate dashboard view
 */
const ProductStats = ({ products, activeFilter, onStatClick }) => {
  const stats = useMemo(() => {
    const active = products.filter(
      (p) => !p.isArchived && p.status === "active" && p.stock > 0
    ).length;
    const inactive = products.filter(
      (p) => !p.isArchived && (p.status === "inactive" || p.stock === 0)
    ).length;
    const archived = products.filter((p) => p.isArchived).length;
    return { active, inactive, archived };
  }, [products]);

  const statItems = [
    {
      id: "active",
      label: "Active",
      count: stats.active,
      color: "emerald",
      icon: CheckCircle,
      bgColor: "bg-emerald-600",
    },
    {
      id: "inactive",
      label: "Inactive",
      count: stats.inactive,
      color: "orange",
      icon: AlertTriangle,
      bgColor: "bg-orange-500",
    },
    {
      id: "archived",
      label: "Archived",
      count: stats.archived,
      color: "gray",
      icon: Archive,
      bgColor: "bg-gray-500",
      borderColor: "border-gray-300",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {statItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onStatClick(item.id)}
          className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            activeFilter === item.id
              ? `border-${item.color}-300` // Active border
              : "border-gray-100" // Inactive border
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start">
              <span className={`text-3xl font-bold text-gray-800`}>{item.count}</span>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">
                {item.label} Products
              </span>
            </div>
            <div
              className={`rounded-full p-3 bg-${item.color}-100 transition-colors group-hover:bg-${item.color}-600`} // Darker bg-600 on hover
            >
              <item.icon
                className={`h-6 w-6 text-${item.color}-600 transition-colors group-hover:text-white group-hover:bg-${item.bgColor}`}
              />
            </div>
          </div>
          {/* This div now conditionally scales based on activeFilter or hover */}
          <div
            className={`absolute bottom-0 left-0 h-1.5 w-full ${
              item.bgColor
            } origin-left transform transition-transform duration-300 ease-in-out ${
              activeFilter === item.id ? "scale-x-100" : "scale-x-0" // Show if active
            } group-hover:scale-x-100`} // Also show on hover
          />
        </button>
      ))}
    </div>
  );
};

export default ProductStats;
