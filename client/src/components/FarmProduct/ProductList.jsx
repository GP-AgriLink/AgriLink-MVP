import { useMemo, useCallback, memo } from "react";
import ProductListHeader from "./ProductListHeader";
import ProductStats from "./ProductStats";
import FilteredProductList from "./FilteredProductList";
import EmptyState from "./EmptyState";
import { useProducts } from "../../context/ProductsContext";

const ProductList = memo(
  ({
    products,
    onEdit,
    onArchive,
    onRestore,
    onActivate,
    onAddNew,
    stats,
    statsLoading,
    onStatsRefresh,
  }) => {
    const { activeFilter, setFilter, activeSearch, activeCategory } = useProducts();

    const handleStatClick = useCallback(
      (filter) => {
        setFilter(filter);
      },
      [setFilter]
    );

    const totalProducts = useMemo(
      () => (stats?.active || 0) + (stats?.inactive || 0) + (stats?.archived || 0),
      [stats]
    );
    const hasActiveFilters = useMemo(
      () => activeSearch || activeCategory,
      [activeSearch, activeCategory]
    );
    const hasNoProductsAtAll = useMemo(
      () => totalProducts === 0 && !hasActiveFilters,
      [totalProducts, hasActiveFilters]
    );

    return (
      <section className="space-y-8">
        <ProductListHeader onAddNew={onAddNew} onStatsRefresh={onStatsRefresh} />
        <ProductStats
          activeFilter={activeFilter}
          onStatClick={handleStatClick}
          stats={stats}
          loading={statsLoading}
        />
        {hasNoProductsAtAll ? (
          <EmptyState onAddNew={onAddNew} />
        ) : products.length > 0 ? (
          <FilteredProductList
            products={products}
            isArchived={activeFilter === "archived"}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            onActivate={onActivate}
            activeFilter={activeFilter}
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
            onActivate={onActivate}
            activeFilter={activeFilter}
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
  }
);

ProductList.displayName = "ProductList";

export default ProductList;
