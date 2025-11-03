import { useState, useEffect } from "react";
import ProductList from "../components/FarmProduct/ProductList";
import {
  getMyProducts,
  archiveProduct,
  restoreProduct,
} from "../services/farmProductApi";

/**
 * MyProductsPage
 * Product inventory management interface for farmers
 * Handles fetching, archiving, and restoring products
 * @param {Function} onEdit - Handler for product edit action
 * @param {Function} onAddNew - Handler for new product creation
 */
const MyProductsPage = ({ onEdit, onAddNew }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    window.refreshProducts = fetchProducts;
    return () => {
      delete window.refreshProducts;
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProducts();
      // Handle different response formats
      const productsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];
      setProducts(productsArray);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProduct = async (productId) => {
    try {
      await archiveProduct(productId);
      // Optimistically update UI
      setProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id) === productId
            ? { ...p, isArchived: true }
            : p
        )
      );
    } catch (err) {
      console.error("Error archiving product:", err);
      alert("Failed to archive product. Please try again.");
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      const restoredProduct = await restoreProduct(productId);
      // Update with response data from server
      setProducts((prev) =>
        prev.map(p => (p._id || p.id) === productId ? restoredProduct : p)
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to restore product. Please try again.";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
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
          <p className="text-red-700 font-semibold mb-2">Error Loading Products</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8 3xl:px-8 py-2">
      <div className="max-w-[1600px] mx-auto">
        <ProductList
          products={products}
          onEdit={onEdit}
          onArchive={handleArchiveProduct}
          onRestore={handleRestoreProduct}
          onAddNew={onAddNew}
        />
      </div>
    </div>
  );
};

export default MyProductsPage;
