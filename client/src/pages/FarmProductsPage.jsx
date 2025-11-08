import { useProducts } from "../context/ProductsContext";
import ProductList from "../components/FarmProduct/ProductList";
import { archiveProduct, updateProduct } from "../services/farmProductApi";
import { toast } from "react-toastify";

/**
 * MyProductsPage
 * Product inventory management interface for farmers
 * @param {Function} onEdit - Handler for product edit action
 * @param {Function} onAddNew - Handler for new product creation
 * @param {string} activeFilter - The currently selected filter
 * @param {Function} onFilterChange - Handler to change the filter
 */
const MyProductsPage = ({ onEdit, onAddNew, activeFilter, onFilterChange }) => {
  const { products, loading, error, refreshProducts, setLoading } = useProducts();

  const handleArchiveProduct = async (productId) => {
    setLoading(true);
    try {
      await archiveProduct(productId);
      toast.success("Product archived.");
      refreshProducts();
    } catch (err) {
      console.error("Error archiving product:", err);
      toast.error("Failed to archive product. Please try again.");
      setLoading(false);
    }
  };

  const handleRestoreProduct = async (productId) => {
    setLoading(true);
    const productToRestore = products.find((p) => (p._id || p.id) === productId);
    if (!productToRestore) {
      toast.error("Error: Product not found.");
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
      toast.success("Product restored.");
      refreshProducts();
    } catch (err) {
      const errorMessage = err.message || "Failed to restore product. Please try again.";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

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
          activeFilter={activeFilter}
          onEdit={onEdit}
          onArchive={handleArchiveProduct}
          onRestore={handleRestoreProduct}
          onAddNew={onAddNew}
          onFilterChange={onFilterChange}
        />
      </div>
    </div>
  );
};

export default MyProductsPage;
