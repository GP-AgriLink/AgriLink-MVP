import { useMemo } from "react";
import ProductListHeader from "./ProductListHeader";
import ProductStats from "./ProductStats";
import FilteredProductList from "./FilteredProductList";
import EmptyState from "./EmptyState";
import { useProducts } from "../../context/ProductsContext";

const ProductList = ({ products, onEdit, onArchive, onRestore, onAddNew }) => {
  const { activeCategory: activeFilter, setFilter: onFilterChange } = useProducts();

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

      <ProductStats products={products} activeFilter={activeFilter} onStatClick={handleStatClick} />

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
