import ProductRow from "./ProductRow";
import EmptyState from "./EmptyState";
import { Search } from "lucide-react";
import { useProducts } from "../../context/ProductsContext";

/**
 * FilteredProductList
 * Displays a paginated and searchable list of products for a specific filter.
 * This component now gets its search state from ProductsContext.
 *
 * @param {Array} products - Pre-filtered list of products (e.g., only active)
 * @param {boolean} isArchived - Whether this list is for archived products
 * @param {Function} onEdit - Handler for edit action
 * @param {Function} onArchive - Handler for archive action
 * @param {Function} onRestore - Handler for restore action
 */
const FilteredProductList = ({
  products,
  isArchived = false,
  onEdit,
  onArchive,
  onRestore,
  emptyTitle,
  emptyMessage,
}) => {
  // Get all necessary state from the context
  const {
    page: currentPage,
    totalPages,
    goToPage: handlePageChange,
    activeSearch, // The current search term from context
    setSearchQuery, // The function to update the search term in context
  } = useProducts();

  // This handler now updates the global context, triggering a server refetch
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const themColor = isArchived ? "gray" : products.length === 0 ? "orange" : "emerald";

  // This logic is now: "If the server returned no products, AND we were not searching for anything"
  if (products.length === 0 && !activeSearch) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <section className="space-y-4">
      {/* Search and Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by product name..."
            value={activeSearch} // Bind to context value
            onChange={handleSearchChange} // Bind to context setter
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
        <span
          className={`bg-${themColor}-100 text-${themColor}-700 rounded-full px-4 py-1 text-sm font-medium`}
        >
          {products.length} {products.length === 1 ? "Product" : "Products"}
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        {/* Table Header */}
        <div
          className={`grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500`}
        >
          <div className="col-span-1 text-center">Image</div>
          <div className="col-span-2 text-start">Product Name </div>
          <div className="col-span-1 text-center">Price</div>
          <div className="col-span-1 text-center">Stock</div>
          <div className="col-span-4 text-start">Description</div>
          <div className="col-span-3 pe-3 text-end">Actions</div>
        </div>

        {/* Table Body */}
        {products.length > 0 ? (
          <div>
            {products.map((product, i) => (
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
        ) : (
          // This view is shown when products.length is 0 but activeSearch IS NOT empty
          <div className="p-10 text-center">
            <p className="font-semibold text-gray-700">No products match your search.</p>
            <p className="mt-1 text-sm text-gray-500">
              Try clearing the search or using different keywords.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${"bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"}`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                currentPage === idx + 1
                  ? `bg-${themColor}-600 text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${"bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"}`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default FilteredProductList;
