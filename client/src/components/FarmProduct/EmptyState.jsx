import { memo } from "react";
import { Plus, Sparkles } from "lucide-react";
import noProductImage from "/no-products.svg";

/**
 * EmptyState - Enhanced with animations and modern design
 * Placeholder displayed when no products exist
 * @param {Function} onAddNew - Handler to trigger product creation flow
 * @param {string} title - The main message to display
 * @param {string} message - The sub-message
 */
const EmptyState = memo(
  ({
    onAddNew,
    title = "No Products Yet",
    message = "Start by adding your first product to showcase your farm's offerings.",
  }) => {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center"
        style={{ animation: "fadeInScale 0.6s ease-out" }}
      >
        {/* Animated container with gradient border */}
        <div className="group relative max-w-lg">
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 animate-pulse rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-30 blur-sm transition-opacity duration-300 group-hover:opacity-50" />

          {/* Content container */}
          <div className="relative rounded-3xl bg-white p-8 shadow-xl">
            {/* Image with float animation */}
            <div className="relative mb-6">
              <img
                src={noProductImage}
                alt="No products found"
                className="mx-auto h-64 w-64 object-contain transition-transform duration-500 group-hover:scale-105"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />

              {/* Sparkle decorations */}
              <Sparkles className="absolute left-1/4 top-4 h-6 w-6 animate-pulse text-emerald-400 opacity-70" />
              <Sparkles className="absolute right-1/4 top-12 h-5 w-5 animate-pulse text-teal-400 opacity-50 delay-150" />
              <Sparkles className="absolute bottom-8 left-1/3 h-4 w-4 animate-pulse text-emerald-300 opacity-60 delay-300" />
            </div>

            {/* Title with gradient */}
            <h2 className="mb-3 bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-3xl font-bold text-transparent">
              {title}
            </h2>

            {/* Message */}
            <p className="mb-6 leading-relaxed text-gray-600">{message}</p>

            {/* Enhanced CTA button */}
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="group/btn relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
              >
                {/* Animated background layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />

                {/* Icon with rotation */}
                <div className="relative rounded-full bg-white/20 p-1.5 transition-transform duration-300 group-hover/btn:rotate-90">
                  <Plus className="h-5 w-5" strokeWidth={3} />
                </div>

                {/* Text */}
                <span className="relative text-lg">Add Your First Product</span>

                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              </button>
            )}
          </div>
        </div>

        <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
