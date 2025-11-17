import { useState, useEffect } from "react";
import ProductListHeader from "./ProductListHeader";
import ProductStats from "./ProductStats";
import FilteredProductList from "./FilteredProductList";
import EmptyState from "./EmptyState";
import { useProducts } from "../../context/ProductsContext";

const ProductList = ({ products, onEdit, onArchive, onRestore, onAddNew, refreshTrigger }) => {
  const { activeFilter, setFilter, activeSearch, activeCategory } = useProducts();

  // Handler for stat block clicks
  const handleStatClick = (filter) => {
    setFilter(filter);
  };

  // Only show complete empty state if there are no products AND no active filters
  // If there are search/category filters active, we should still show the full UI
  const hasActiveFilters = activeSearch || activeCategory;
  const hasNoProductsAtAll = products.length === 0 && activeFilter === "active" && !hasActiveFilters;

  if (hasNoProductsAtAll) {
    return (
      <section className="space-y-8">
        <ProductListHeader onAddNew={onAddNew} />
        <EmptyState onAddNew={onAddNew} />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header Section */}
      <ProductListHeader onAddNew={onAddNew} />

      {/* Stats Component - fetches its own data from API */}
      <ProductStats 
        activeFilter={activeFilter} 
        onStatClick={handleStatClick}
        refreshTrigger={refreshTrigger}
      />

      {/* Products are already filtered by backend based on activeFilter */}
      {products.length > 0 ? (
        <FilteredProductList
          products={products}
          isArchived={activeFilter === "archived"}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          emptyTitle={`No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Products`}
          emptyMessage={
            activeFilter === "active"
              ? "You have no active products. Try adding a new product or restoring an archived one."
              : activeFilter === "inactive"
              ? "These are products that are out of stock or manually set to 'inactive'."
              : "Products you archive will appear here. You can restore them at any time."
          }
        />
      ) : (
        <FilteredProductList
          products={[]}
          isArchived={activeFilter === "archived"}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          emptyTitle={`No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Products`}
          emptyMessage={
            activeFilter === "active"
              ? "You have no active products. Try adding a new product or restoring an archived one."
              : activeFilter === "inactive"
              ? "These are products that are out of stock or manually set to 'inactive'."
              : "Products you archive will appear here. You can restore them at any time."
          }
        />
      )}
    </section>
  );
};

export default ProductList;
