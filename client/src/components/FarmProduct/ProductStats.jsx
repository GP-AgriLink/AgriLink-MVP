import { memo } from "react";
import { Package, PackageX, Archive } from "lucide-react";

/**
 * ProductStats - Compact unified design
 * Displays premium stat cards with consistent sizing across all stats components
 */
const ProductStats = memo(
  ({
    activeFilter,
    onStatClick,
    stats = { active: 0, inactive: 0, archived: 0 },
    loading = false,
  }) => {
    const statItems = [
      {
        id: "active",
        label: "Active",
        count: stats.active || 0,
        icon: Package,
        gradient: "from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        activeRing: "ring-emerald-500/20",
        activeShadow: "shadow-emerald-500/10",
      },
      {
        id: "inactive",
        label: "Inactive",
        count: stats.inactive || 0,
        icon: PackageX,
        gradient: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        activeRing: "ring-amber-500/20",
        activeShadow: "shadow-amber-500/10",
      },
      {
        id: "archived",
        label: "Archived",
        count: stats.archived || 0,
        icon: Archive,
        gradient: "from-slate-500 to-gray-700",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        activeRing: "ring-slate-500/20",
        activeShadow: "shadow-slate-500/10",
      },
    ];

    return (
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onStatClick(item.id)}
              disabled={loading}
              className={`group relative overflow-hidden rounded-xl border bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? `border-transparent shadow-lg ring-2 ${item.activeRing} ${item.activeShadow}`
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label={`View ${item.label} products`}
              aria-pressed={isActive}
            >
              {/* Loading skeleton overlay */}
              {loading && (
                <div className="absolute inset-0 z-10 animate-pulse bg-white/80 backdrop-blur-sm" />
              )}

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
                  <span className="text-2xl font-bold text-gray-800">
                    {loading ? "..." : item.count}
                  </span>
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
  }
);

ProductStats.displayName = "ProductStats";

export default ProductStats;
