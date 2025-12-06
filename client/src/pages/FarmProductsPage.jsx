import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import ProductList from "../components/FarmProduct/ProductList";
import { archiveProduct, updateProduct } from "../services/farmProductApi";
import { getDashboardStats } from "../services/farmApi";
import { toast } from "react-toastify";
import { ProductsPageSkeleton } from "../components/FarmProduct/Skeletons";

/**
 * MyProductsPage - Optimized with smart stats updates
 * Features:
 * - Optimistic stats updates on product actions
 * - Debounced stats fetching for network optimization
 * - Immediate UI feedback
 * - Registers stats refresh callback with Dashboard
 */
const MyProductsPage = ({ onEdit, onAddNew }) => {
  const { products, loading, error, refreshProducts, setLoading } = useProducts();
  const [stats, setStats] = useState({ active: 0, inactive: 0, archived: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const fetchStatsTimeoutRef = useRef(null);
  const lastProductsLengthRef = useState(0);

  // Get stats refresh registration from Dashboard outlet context
  const outletContext = useOutletContext() || {};
  const { onRegisterStatsRefresh } = outletContext;

  // Smart stats update effect with optimization
  useEffect(() => {
    // Skip if products length hasn't changed
    if (products.length === lastProductsLengthRef.current && stats.active !== 0) {
      return;
    }

    lastProductsLengthRef.current = products.length;

    // Clear any pending fetch
    if (fetchStatsTimeoutRef.current) {
      clearTimeout(fetchStatsTimeoutRef.current);
    }

    // Debounced stats fetch
    fetchStatsTimeoutRef.current = setTimeout(async () => {
      try {
        setStatsLoading(true);
        const data = await getDashboardStats();
        setStats(data.products || { active: 0, inactive: 0, archived: 0 });
      } catch (err) {
        console.error("Failed to load product stats", err);
        setStats({ active: 0, inactive: 0, archived: 0 });
      } finally {
        setStatsLoading(false);
      }
    }, 300);

    return () => {
      if (fetchStatsTimeoutRef.current) {
        clearTimeout(fetchStatsTimeoutRef.current);
      }
    };
  }, [products.length, stats.active]);

  // Optimistic stats update helper
  const updateStatsOptimistically = useCallback((updates) => {
    setStats((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleArchiveProduct = useCallback(
    async (productId) => {
      const product = products.find((p) => (p._id || p.id) === productId);
      if (!product) return;

      setLoading(true);

      // Optimistic update UI immediately
      const wasActive = product.status === "active";
      const wasInactive = product.status === "inactive";

      updateStatsOptimistically({
        active: stats.active - (wasActive ? 1 : 0),
        inactive: stats.inactive - (wasInactive ? 1 : 0),
        archived: stats.archived + 1,
      });

      try {
        await archiveProduct(productId);
        toast.success("Product Archived");
        await refreshProducts();

        // Stats will auto-refresh from useEffect
      } catch (err) {
        console.error("Error archiving product:", err);
        toast.error(err.message || "Failed to archive product");

        // Revert optimistic update on error
        updateStatsOptimistically({
          active: stats.active,
          inactive: stats.inactive,
          archived: stats.archived,
        });

        setLoading(false);
      }
    },
    [products, refreshProducts, setLoading, stats, updateStatsOptimistically]
  );

  const handleRestoreProduct = useCallback(
    async (productId) => {
      const productToRestore = products.find((p) => (p._id || p.id) === productId);
      if (!productToRestore) {
        toast.error("Product not found");
        return;
      }

      setLoading(true);

      const stock = productToRestore.stock || 0;
      const willBeActive = stock > 0;

      // Optimistic update
      updateStatsOptimistically({
        active: stats.active + (willBeActive ? 1 : 0),
        inactive: stats.inactive + (!willBeActive ? 1 : 0),
        archived: stats.archived - 1,
      });

      const updateData = {
        isArchived: false,
        status: willBeActive ? "active" : "inactive",
      };

      try {
        await updateProduct(productId, updateData);
        toast.success("Product Restored");
        await refreshProducts();

        // Stats will auto-refresh from useEffect
      } catch (err) {
        const errorMessage = err.message || "Failed to restore product. Please try again.";
        toast.error(errorMessage);

        // Revert optimistic update
        updateStatsOptimistically({
          active: stats.active,
          inactive: stats.inactive,
          archived: stats.archived,
        });

        setLoading(false);
      }
    },
    [products, refreshProducts, setLoading, stats, updateStatsOptimistically]
  );

  // Manual stats refresh (called after adding product)
  const handleStatsRefresh = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getDashboardStats();
      setStats(data.products || { active: 0, inactive: 0, archived: 0 });
    } catch (err) {
      console.error("Failed to refresh stats", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Register stats refresh callback with Dashboard
  useEffect(() => {
    if (onRegisterStatsRefresh) {
      onRegisterStatsRefresh(handleStatsRefresh);
    }
  }, [onRegisterStatsRefresh, handleStatsRefresh]);

  // Show skeleton during initial loading
  if (loading) {
    return <ProductsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mb-2 font-semibold text-red-700">Error Loading Products</p>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            onClick={refreshProducts}
            className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 sm:px-8 md:px-12 lg:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto max-w-[1600px]">
        <ProductList
          products={products}
          onEdit={onEdit}
          onArchive={handleArchiveProduct}
          onRestore={handleRestoreProduct}
          onAddNew={onAddNew}
          stats={stats}
          statsLoading={statsLoading}
          onStatsRefresh={handleStatsRefresh}
        />
      </div>
    </div>
  );
};

export default MyProductsPage;
