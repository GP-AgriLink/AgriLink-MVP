import { memo } from "react";

/**
 * OrdersGridSkeleton - Skeleton loader for order cards grid
 */
export const OrdersGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 items-start justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-2 3xl:grid-cols-3">
    {[...Array(6)].map((_, idx) => (
      <div key={idx} className="w-full max-w-[420px] 3xl:max-w-[520px] animate-pulse">
        <div className="bg-white border border-green-100 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </div>
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
            <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

OrdersGridSkeleton.displayName = 'OrdersGridSkeleton';

/**
 * TableSkeleton - Skeleton loader for orders table
 */
export const TableSkeleton = memo(() => (
  <div className="bg-white shadow-lg rounded-2xl border border-green-100 overflow-hidden animate-pulse">
    <table className="min-w-full text-sm">
      <thead className="bg-green-100">
        <tr>
          <th className="py-4 px-6 text-start"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
          <th className="py-4 px-6 text-start"><div className="h-4 w-24 bg-gray-200 rounded" /></th>
          <th className="py-4 px-6 text-start"><div className="h-4 w-16 bg-gray-200 rounded" /></th>
          <th className="py-4 px-6 text-start"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
          <th className="py-4 px-6 text-start"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, i) => (
          <tr key={i} className="border-t">
            <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

/**
 * OrderPageSkeleton - Full page skeleton for OrdersPage
 */
export const OrderPageSkeleton = memo(() => (
  <div className="min-h-screen px-4 py-8 sm:px-8 md:px-12 lg:px-16 2xl:px-8 3xl:px-8">
    <div className="mx-auto flex max-w-[1600px] flex-col gap-8">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-md animate-pulse">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 3xl:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

OrderPageSkeleton.displayName = 'OrderPageSkeleton';
