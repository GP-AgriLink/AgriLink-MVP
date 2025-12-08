import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Edit2, Archive, RotateCcw, Power } from "lucide-react";
import ProductImage from "./ProductImage";

/**
 * ProductRow - Enhanced with lazy loading and animations
 * Renders a single product entry in the table with stock status, actions, and smooth transitions
 * @param {Object} product - Product data object
 * @param {number} index - Row index for styling
 * @param {boolean} isArchived - Whether product is archived
 * @param {string} activeFilter - Current filter ('active', 'inactive', 'archived')
 * @param {Function} onEdit - Handler for edit action
 * @param {Function} onArchive - Handler for archive action
 * @param {Function} onRestore - Handler for restore action
 * @param {Function} onActivate - Handler for quick activate action
 */
const ProductRow = memo(
  ({
    product,
    index,
    isArchived = false,
    activeFilter,
    onEdit,
    onArchive,
    onRestore,
    onActivate,
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const rowRef = useRef(null);

    const formatPrice = useCallback((price) => {
      const numPrice = typeof price === "string" ? parseFloat(price) : price;
      return `$${numPrice.toFixed(2)}`;
    }, []);

    const LOW_STOCK_THRESHOLD = 10;
    const outOfStock = product.stock === 0;
    const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

    const getStockStatusLabel = useCallback(() => {
      if (outOfStock) return "Out of Stock";
      if (lowStock) return "Low Stock";
      return "In Stock";
    }, [outOfStock, lowStock]);

    const getStockStatusColor = useCallback(() => {
      if (outOfStock) return "text-orange-600";
      if (lowStock) return "text-yellow-600";
      return "text-emerald-600";
    }, [outOfStock, lowStock]);

    // Lazy loading with Intersection Observer
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: "100px" }
      );

      if (rowRef.current) {
        observer.observe(rowRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const hoverClass = isArchived
      ? "hover:bg-gray-100 hover:shadow-sm"
      : "hover:bg-emerald-50/50 hover:shadow-sm";

    const bgClass = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";

    return (
      <div
        ref={rowRef}
        className={`group grid grid-cols-12 items-center gap-4 border-t px-4 py-3.5 transition-all duration-200 ${hoverClass} ${bgClass} ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{
          animation: isVisible ? `fadeInUp 0.4s ease-out ${index * 0.05}s both` : "none",
        }}
      >
        {/* Image with lazy loading */}
        <div className="col-span-1 text-center">
          <ProductImage
            imageUrl={product.imageUrl}
            productName={product.name}
            size="sm"
            lazy={true}
          />
        </div>

        {/* Product Name with animation */}
        <div className="col-span-2 text-start">
          <div className="text-sm font-medium text-gray-900 transition-colors group-hover:text-emerald-600">
            {product.name}
          </div>
          {isArchived && (
            <span className="animate-fadeIn mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
              Archived
            </span>
          )}
        </div>

        {/* Price */}
        <div className="col-span-1 text-center">
          <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
          <div className="text-xs text-gray-500">{product.unit}</div>
        </div>

        {/* Stock with status indicator */}
        <div className="col-span-1 text-center">
          <div className="flex flex-col gap-1">
            <span className={`text-sm font-medium transition-colors ${getStockStatusColor()}`}>
              {product.stock}
            </span>

            {(lowStock || outOfStock) && (
              <span className={`${getStockStatusColor()} animate-pulse text-xs font-medium`}>
                {getStockStatusLabel()}
              </span>
            )}
          </div>
        </div>

        {/* Description with fade-in */}
        <div className="col-span-4 text-start">
          <p className="line-clamp-2 overflow-hidden text-sm text-gray-600 transition-colors group-hover:text-gray-700">
            {product.description || "No description available"}
          </p>
        </div>

        {/* Actions with hover animations */}
        <div className="col-span-3 flex justify-end gap-2 text-end">
          {!isArchived ? (
            <>
              <button
                onClick={() => onEdit(product)}
                className="group/btn flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-all hover:scale-105 hover:border-gray-300 hover:bg-white hover:shadow-md active:scale-95"
                title="Edit product"
              >
                <Edit2 className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                Edit
              </button>
              <button
                onClick={() => onArchive(product._id || product.id)}
                className="group/btn flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:bg-orange-600 hover:shadow-lg active:scale-95"
                title="Archive product"
              >
                <Archive className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                Archive
              </button>
            </>
          ) : (
            <button
              onClick={() => onRestore(product._id || product.id)}
              className="group/btn flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:bg-emerald-700 hover:shadow-lg active:scale-95"
              title="Restore product"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-180" />
              Restore
            </button>
          )}

          {/* Quick Activate Button - Only show for inactive products when viewing inactive filter */}
          {!isArchived && activeFilter === "inactive" && product.status === "inactive" && (
            <button
              onClick={() => onActivate(product._id || product.id)}
              className="group/btn flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg active:scale-95"
              title="Activate this product"
            >
              <Power className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
              Activate
            </button>
          )}
        </div>

        {/* Bottom border animation on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-transform duration-300 group-hover:scale-x-100" />

        <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      </div>
    );
  }
);

ProductRow.displayName = "ProductRow";

export default ProductRow;
