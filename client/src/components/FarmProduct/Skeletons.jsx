import { memo } from "react";

/**
 * ProductsGridSkeleton - Loading state for products table
 * Displays an animated skeleton loader matching the products table layout
 */
export const ProductsGridSkeleton = memo(() => (
  <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
    {/* Table Header with shimmer effect */}
    <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3">
      <div className="col-span-1 text-center">
        <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="col-span-2 text-start">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="col-span-1 text-center">
        <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="col-span-1 text-center">
        <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="col-span-4 text-start">
        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="col-span-3 text-end">
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </div>

    {/* Table Rows with staggered animation */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`grid grid-cols-12 items-center gap-4 border-t px-4 py-3 transition-colors duration-200 ${
          i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
        }`}
        style={{
          animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s both`,
        }}
      >
        {/* Image with shimmer */}
        <div className="col-span-1 text-center">
          <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>

        {/* Product Name */}
        <div className="col-span-2 space-y-2 text-start">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Price */}
        <div className="col-span-1 space-y-1.5 text-center">
          <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Stock */}
        <div className="col-span-1 text-center">
          <div className="mx-auto h-4 w-12 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Description */}
        <div className="col-span-4 space-y-1.5 text-start">
          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Actions */}
        <div className="col-span-3 flex justify-end gap-2">
          <div className="h-8 w-16 animate-pulse rounded-md bg-gray-200" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-gray-200" />
        </div>
      </div>
    ))}

    {/* Bottom shimmer effect */}
    <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-200 to-transparent opacity-50" />
  </div>
));

ProductsGridSkeleton.displayName = "ProductsGridSkeleton";

/**
 * ProductsPageSkeleton - Full page skeleton with staggered animations
 * Includes header, stats, filters, and product grid
 */
export const ProductsPageSkeleton = memo(() => (
  <div className="animate-fadeIn px-4 py-2 sm:px-8 md:px-12 lg:px-16 2xl:px-8 3xl:px-8">
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Header with slide-in animation */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "slideInDown 0.4s ease-out" }}
      >
        <div className="h-9 w-56 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
        <div className="h-11 w-44 animate-pulse rounded-lg bg-gradient-to-r from-emerald-200 to-emerald-300 shadow-lg" />
      </div>

      {/* Stats with staggered fade-in */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md"
            style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
          >
            <div className="flex items-center gap-3">
              {/* Icon skeleton with shimmer */}
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
              {/* Text skeletons */}
              <div className="space-y-2">
                <div className="h-7 w-14 animate-pulse rounded bg-gray-300" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar with scale animation */}
      <div
        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg"
        style={{ animation: "scaleIn 0.4s ease-out 0.2s both" }}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
          <div className="lg:col-span-3">
            <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-6 w-36 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="flex justify-end lg:col-span-1">
            <div className="h-8 w-14 animate-pulse rounded-full bg-emerald-200" />
          </div>
        </div>
      </div>

      {/* Table with fade-in */}
      <div style={{ animation: "fadeInUp 0.5s ease-out 0.3s both" }}>
        <ProductsGridSkeleton />
      </div>
    </div>

    {/* Global keyframes for animations */}
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>
  </div>
));

ProductsPageSkeleton.displayName = "ProductsPageSkeleton";
