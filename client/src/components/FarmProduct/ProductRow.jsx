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
const ProductRow = ({ product, index, isArchived = false, onEdit, onArchive, onRestore }) => {
  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  const LOW_STOCK_THRESHOLD = 10;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  const getStockStatusLabel = () => {
    if (outOfStock) return "Out of Stock";
    if (lowStock) return "Low Stock";
    return "In Stock";
  };

  const getStockStatusColor = () => {
    if (outOfStock) return "text-orange-600";
    if (lowStock) return "text-yellow-600";
    return "text-emerald-600";
  };

  const hoverClass = isArchived ? "hover:bg-gray-100" : "hover:bg-emerald-50";
  const bgClass = index % 2 === 0 ? "bg-white" : "bg-gray-50";

  return (
    <div
      className={`grid grid-cols-12 items-center gap-4 border-t px-4 py-3 ${hoverClass} transition ${bgClass}`}
    >
      {/* Image */}
      <div className="col-span-1 text-center">
        <ProductImage imageUrl={product.imageUrl} productName={product.name} size="sm" />
      </div>

      {/* Product Name */}
      <div className="col-span-2 text-start">
        <div className="text-sm font-medium text-gray-900">{product.name}</div>
        {isArchived && (
          <span className="mt-1 inline-block rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Archived
          </span>
        )}
      </div>

      {/* Price */}
      <div className="col-span-1 text-center">
        <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
        <div className="text-xs text-gray-500">{product.unit}</div>
      </div>

      {/* Stock */}
      <div className="col-span-1 text-center">
        <div className="flex flex-col gap-1">
          <span className={`text-sm font-medium ${getStockStatusColor()}`}>{product.stock}</span>

          {(lowStock || outOfStock) && (
            <span className={`${getStockStatusColor()} text-xs font-medium`}>
              {getStockStatusLabel()}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="col-span-4 text-start">
        <p className="line-clamp-2 overflow-hidden text-sm text-gray-600">
          {product.description || "No description available"}
        </p>
      </div>

      {/* Actions */}
      <div className="col-span-3 flex justify-end gap-2 text-end">
        {!isArchived ? (
          <>
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
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
              className="flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600"
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
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
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
