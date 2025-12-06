import { memo } from "react";

/**
 * DashboardSkeleton - Unified loading state for dashboard views
 * Provides consistent skeleton UI across all dashboard sections
 */
const DashboardSkeleton = memo(() => {
  return (
    <div className="animate-pulse space-y-6 p-6 sm:p-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-1/3 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
        <div className="h-10 w-32 rounded-lg bg-gradient-to-r from-emerald-200 to-emerald-300" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>

      {/* Filter/Search bar skeleton */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-200" />
        <div className="h-10 w-32 rounded-lg bg-gray-200" />
      </div>

      {/* Content area skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
});

DashboardSkeleton.displayName = "DashboardSkeleton";

export default DashboardSkeleton;
