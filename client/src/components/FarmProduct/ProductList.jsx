import { useMemo } from "react";
import ProductListHeader from "./ProductListHeader";
// import ProductStats from "./ProductStats";
import FilteredProductList from "./FilteredProductList";
import EmptyState from "./EmptyState";

/**
 * ProductList
 * Displays product inventory split into active and archived sections
 * @param {Array} products - Complete list of products
 * @param {string} activeFilter - The currently selected filter ("active", "inactive", "archived")
 * @param {Function} onEdit - Handler for product edit action
 * @param {Function} onArchive - Handler to archive a product
 * @param {Function} onRestore - Handler to restore an archived product
 * @param {Function} onAddNew - Handler to create new product
 * @param {Function} onFilterChange - Handler to change the active filter
 */
const ProductList = ({
  products,
  activeFilter,
  onEdit,
  onArchive,
  onRestore,
  onAddNew,
  onFilterChange,
}) => {
  // Memoize all product filter lists
  const { activeProducts, inactiveProducts, archivedProducts } = useMemo(() => {
    const active = [];
    const inactive = [];
    const archived = [];

    products.forEach((p) => {
      if (p.isArchived) {
        archived.push(p);
      } else if (p.status === "inactive" || p.stock === 0) {
        inactive.push(p);
      } else {
        active.push(p);
      }
    });

    return { activeProducts: active, inactiveProducts: inactive, archivedProducts: archived };
  }, [products]);

  // Handler for stat block clicks
  const handleStatClick = (filter) => {
    onFilterChange(filter);
  };

  // If there are no products at all, show the main empty state
  if (products.length === 0) {
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

      {/* Statistics Section - Now passes activeFilter */}
      {/* <ProductStats products={products} activeFilter={activeFilter} onStatClick={handleStatClick} /> */}

      {/* Active Products List - Default */}
      {(activeFilter === "active" || !activeFilter) && (
        <FilteredProductList
          products={activeProducts}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          emptyTitle="No Active Products"
          emptyMessage="You have no active products. Try adding a new product or restoring an archived one."
        />
      )}

      {/* Inactive Products List */}
      {activeFilter === "inactive" && (
        <FilteredProductList
          products={inactiveProducts}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          emptyTitle="No Inactive Products"
          emptyMessage="These are products that are out of stock or manually set to 'inactive'."
        />
      )}

      {/* Archived Products List */}
      {activeFilter === "archived" && (
        <FilteredProductList
          products={archivedProducts}
          isArchived={true}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
          emptyTitle="No Archived Products"
          emptyMessage="Products you archive will appear here. You can restore them at any time."
        />
      )}
    </section>
  );
};

export default ProductList;
