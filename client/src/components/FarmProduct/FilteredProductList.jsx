import { useState, useEffect } from "react";
import ProductRow from "./ProductRow";
import EmptyState from "./EmptyState";
import { Search, X, Filter } from "lucide-react";
import { useProducts } from "../../context/ProductsContext";
import { getAllCategories } from "../../services/farmProductApi";

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
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Get all necessary state from the context
  const {
    page: currentPage,
    totalPages,
    totalProducts,
    goToPage: handlePageChange,
    activeSearch,
    activeCategory,
    searchInput,
    setSearchInput,
    categoryInput,
    setCategoryInput,
    applyFilters,
    setCategoryFilter,
    clearFilters,
  } = useProducts();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const cats = await getAllCategories();
        setCategories(cats || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    // Apply category filter immediately
    setCategoryFilter(newCategory);
  };

  const themColor = isArchived ? "gray" : products.length === 0 ? "orange" : "emerald";
  const hasActiveFilters = activeSearch || activeCategory;

  // Don't show the empty state component - always render the filters and table
  // The empty message will be shown in the table body when needed

  return (
    <section className="space-y-4">
      {/* Modern Single-Row Filter Header */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-lg backdrop-blur-sm">
        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center">
            {/* Search Input with integrated button */}
            <div className="lg:col-span-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 active:scale-95"
                  title="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="lg:col-span-3">
              <div className="relative">
                <select
                  value={categoryInput}
                  onChange={handleCategoryChange}
                  disabled={loadingCategories}
                  className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-gray-700 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="lg:col-span-4">
              {hasActiveFilters ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        applyFilters();
                      }}
                      className="group inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md"
                      title="Remove search filter"
                    >
                      <Search className="h-3 w-3" />
                      <span className="max-w-[100px] truncate">{activeSearch}</span>
                      <X className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                    </button>
                  )}
                  {activeCategory && (
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("")}
                      className="group inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-md"
                      title="Remove category filter"
                    >
                      <Filter className="h-3 w-3" />
                      <span className="max-w-[100px] truncate">{activeCategory}</span>
                      <X className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
                    title="Clear all filters"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">No active filters</div>
              )}
            </div>

            {/* Product Count Badge */}
            <div className="flex justify-end lg:col-span-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-${themColor}-100 px-3 py-1.5 text-xs font-bold text-${themColor}-700 ring-1 ring-${themColor}-200 shadow-sm`}
                title="Total products"
              >
                <span className="text-base">{totalProducts}</span>
              </span>
            </div>
          </div>
        </form>
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
          // This view is shown when products.length is 0
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {hasActiveFilters ? "No products found" : emptyTitle}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {hasActiveFilters 
                ? "No products match your current filters. Try adjusting your search or category selection."
                : emptyMessage}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Clear all filters
              </button>
            )}
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
