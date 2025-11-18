import { useState, useEffect, useCallback, useRef } from "react";
import { useProducts } from "../context/ProductsContext";
import ProductList from "../components/FarmProduct/ProductList";
import { archiveProduct, updateProduct } from "../services/farmProductApi";
import { getDashboardStats } from "../services/farmApi";
import { toast } from "react-toastify";

// MyProductsPage: debounced stats fetching and memoized handlers
const MyProductsPage = ({ onEdit, onAddNew }) => {
  const { products, loading, error, refreshProducts, setLoading } = useProducts();
  const [stats, setStats] = useState({ active: 0, inactive: 0, archived: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const fetchStatsTimeoutRef = useRef(null);

  useEffect(() => {
    if (fetchStatsTimeoutRef.current) {
      clearTimeout(fetchStatsTimeoutRef.current);
    }
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
  }, [products.length]);

  const handleArchiveProduct = useCallback(async (productId) => {
    setLoading(true);
    try {
      await archiveProduct(productId);
      toast.success("Product Archived");
      refreshProducts();
    } catch (err) {
      console.error("Error archiving product:", err);
      toast.error(err.message || "Failed to archive product");
      setLoading(false);
    }
  }, [refreshProducts, setLoading]);

  const handleRestoreProduct = useCallback(async (productId) => {
    setLoading(true);
    const productToRestore = products.find((p) => (p._id || p.id) === productId);
    if (!productToRestore) {
      toast.error("Product not found");
      setLoading(false);
      return;
    }

    const stock = productToRestore.stock || 0;
    const updateData = {
      isArchived: false,
      status: stock > 0 ? "active" : "inactive",
    };

    try {
      await updateProduct(productId, updateData);
      toast.success("Product Restored");
      refreshProducts();
    } catch (err) {
      const errorMessage = err.message || "Failed to restore product. Please try again.";
      toast.error(errorMessage);
      setLoading(false);
    }
  }, [products, refreshProducts, setLoading]);

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
        />
      </div>
    </div>
  );
};

export default MyProductsPage;
