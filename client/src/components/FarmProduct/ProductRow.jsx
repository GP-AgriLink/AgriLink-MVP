import { memo } from "react";
import ProductImage from "./ProductImage";

/**
 * ProductRow
 * Renders a single product entry in the table with stock status and actions
 * @param {Object} product - Product data object
 * @param {number} index - Row index for styling
 * @param {boolean} isArchived - Whether product is archived
 * @param {Function} onEdit - Handler for edit action
 * @param {Function} onArchive - Handler for archive action
 * @param {Function} onRestore - Handler for restore action
 */
const ProductRow = ({
  product,
  index,
  isArchived = false,
  onEdit,
  onArchive,
  onRestore
}) => {
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "$0.00"; // UPDATED
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`; // UPDATED
  };

  const LOW_STOCK_THRESHOLD = 10;
  const outOfStock = product.stock === 0 || product.status === "out-of-stock";
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  const getStockStatusLabel = () => {
    if (outOfStock) return "Out of Stock";
    if (lowStock) return "Low Stock";
    return "In Stock";
  };

  const getStockStatusColor = () => {
    if (outOfStock) return "text-red-600";
    if (lowStock) return "text-yellow-600";
    return "text-emerald-600";
  };

  const hoverClass = isArchived ? 'hover:bg-gray-100' : 'hover:bg-emerald-50';
  const bgClass = index % 2 === 0 ? "bg-white" : "bg-gray-50";

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-4 py-3 items-center border-t ${hoverClass} transition ${bgClass}`}
    >
      {/* Image */}
      <div className="col-span-1">
        <ProductImage
          imageUrl={product.imageUrl}
          productName={product.name}
          size="sm"
        />
      </div>

      {/* Product Name */}
      <div className="col-span-2">
        <div className="font-medium text-gray-900 text-sm">
          {product.name}
        </div>
        {isArchived && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
            Archived
          </span>
        )}
      </div>

      {/* Price */}
      <div className="col-span-1">
        <div className="text-sm text-gray-900 font-semibold">
          {formatPrice(product.price)}
        </div>
        <div className="text-xs text-gray-500">/ {product.unit}</div>
      </div>

      {/* Stock */}
      <div className="col-span-1">
        <div className="flex flex-col gap-1">
          <span className={`text-sm font-medium ${getStockStatusColor()}`}>
            {product.stock}
          </span>
          {outOfStock && (
            <span className="text-xs text-red-600 font-medium">
              {getStockStatusLabel()}
            </span>
          )}
          {lowStock && (
            <span className="text-xs text-yellow-600 font-medium">
              {getStockStatusLabel()}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="col-span-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description || "No description available"}
        </p>
      </div>

      {/* Actions */}
      <div className="col-span-3 flex justify-end gap-2">
        {!isArchived ? (
          <>
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-1.5 bg-gray-50 text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 transition flex items-center gap-2 border border-gray-200"
              title="Edit product"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onArchive(product._id || product.id)}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
              title="Archive product"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              Archive
            </button>
          </>
        ) : (
          <button
            onClick={() => onRestore(product._id || product.id)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2"
            title="Restore product"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restore
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ProductRow);