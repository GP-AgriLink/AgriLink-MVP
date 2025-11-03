import { useState } from "react";
import ProductRow from "./ProductRow";

const ITEMS_PER_PAGE = 10;

/**
 * ProductTable
 * Paginated table view for product list with automatic scroll on page change
 * @param {Array} products - Products to display
 * @param {boolean} isArchived - Whether showing archived products
 * @param {Function} onEdit - Handler for edit action
 * @param {Function} onArchive - Handler for archive action
 * @param {Function} onRestore - Handler for restore action
 */
const ProductTable = ({ 
  products, 
  isArchived = false, 
  onEdit, 
  onArchive, 
  onRestore 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fade, setFade] = useState(false);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setFade(true);
    setTimeout(() => {
      setCurrentPage(page);
      setFade(false);
    }, 300);
  };

  const headerBgClass = isArchived ? "bg-gray-100" : "bg-emerald-100";
  const themColor = isArchived ? "gray" : "emerald";

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-b from-white to-white/0 z-10"></div>

        {/* Scrollable table container */}
        <div
          className={`bg-white shadow-lg rounded-2xl border ${
            isArchived ? 'border-gray-200' : 'border-emerald-100'
          } overflow-y-auto max-h-[450px] scroll-smooth custom-scrollbar transition-opacity duration-300 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Table Header */}
          <div className={`${headerBgClass} text-gray-600 uppercase text-xs tracking-wide sticky top-0 z-20`}>
            <div className="grid grid-cols-12 gap-4 px-4 py-3 font-medium">
              <div className="col-span-1">Image</div>
              <div className="col-span-2">Product Name</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {currentProducts.map((product, i) => (
              <ProductRow
                key={product._id || product.id}
                product={product}
                index={i}
                isArchived={isArchived}
                onEdit={onEdit}
                onArchive={onArchive}
                onRestore={onRestore}
              />
            ))}
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-t from-white to-white/0 z-10"></div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-3 py-1.5 rounded-md font-medium transition text-sm ${
                currentPage === idx + 1
                  ? `bg-${themColor}-600 text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductTable;
