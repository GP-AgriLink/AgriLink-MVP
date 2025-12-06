import { memo } from "react";
import { Plus, Sparkles } from "lucide-react";

/**
 * ProductListHeader - Enhanced with animations
 * Displays the main header and 'Add New Product' button with premium styling
 * @param {Function} onAddNew - Handler to create new product
 */
const ProductListHeader = memo(({ onAddNew }) => {
  return (
    <div
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ animation: "slideInDown 0.5s ease-out" }}
    >
      {/* Animated header with gradient */}
      <div className="group relative">
        <h2 className="bg-gradient-to-r from-gray-800 via-gray-700 to-emerald-700 bg-clip-text text-3xl font-bold text-transparent transition-all duration-300 md:text-4xl">
          My Products
        </h2>
        <div className="absolute -bottom-1 left-0 h-1 w-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 group-hover:w-full" />
        {/* Sparkle effect on hover */}
        <Sparkles className="absolute -right-6 -top-1 h-5 w-5 text-emerald-500 opacity-0 transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-100" />
      </div>

      {/* Enhanced Add button with animations */}
      <button
        onClick={onAddNew}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 sm:justify-start"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Button content */}
        <Plus className="relative h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        <span className="relative">Add New Product</span>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </button>

      <style>{`
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
      `}</style>
    </div>
  );
});

ProductListHeader.displayName = "ProductListHeader";

export default ProductListHeader;
