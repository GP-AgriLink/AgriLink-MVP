import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { Menu, X } from "lucide-react";
import { uploadImage } from "../services/uploadService";
import { createProduct, updateProduct } from "../services/farmProductApi";
import { useProducts } from "../context/ProductsContext";
import { toast } from "react-toastify";

// Lazy load modals for better initial bundle size
const AddProduct = lazy(() => import("../components/FarmProduct/AddProduct"));
const EditProduct = lazy(() => import("../components/FarmProduct/EditProduct"));

/**
 * Dashboard - Optimized with global scrolling and responsive design
 * Features:
 * - Global page scrolling (no internal scroll)
 * - Min-height 95vh, grows with content
 * - No horizontal overflow
 * - Custom scrollbar styles (global)
 */
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { setLoading, refreshProducts } = useProducts();
  const statsRefreshCallbackRef = useRef(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isAddProductOpen) setIsAddProductOpen(false);
        if (isEditProductOpen) setIsEditProductOpen(false);
        if (isSidebarOpen) setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddProductOpen, isEditProductOpen, isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("sidebar-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    };
  }, [isSidebarOpen]);

  const handleAddProduct = useCallback(() => {
    setIsAddProductOpen(true);
  }, []);

  const handleEditProduct = useCallback((product) => {
    setProductToEdit(product);
    setIsEditProductOpen(true);
  }, []);

  const handleAddProductSubmit = useCallback(
    async (sanitizedData, imageFile, setUploadProgress, setIsUploading) => {
      setLoading(true);
      let finalData = { ...sanitizedData };

      try {
        if (imageFile) {
          setIsUploading(true);
          setUploadProgress(0);
          toast.info("Uploading image...");

          const uploadResponse = await uploadImage(imageFile, (progress) => {
            setUploadProgress(progress);
          });

          finalData.imageUrl = uploadResponse.imageUrl;
          setIsUploading(false);
        }

        await createProduct(finalData);
        toast.success("Product Created");
        setIsAddProductOpen(false);
        await refreshProducts();

        if (statsRefreshCallbackRef.current) {
          statsRefreshCallbackRef.current();
        }
      } catch (error) {
        console.error("Failed to create product:", error);
        toast.error(error.message || "Failed to create product");
        setLoading(false);
        if (setIsUploading) setIsUploading(false);
        throw error;
      }
    },
    [refreshProducts, setLoading]
  );

  const handleEditProductSubmit = useCallback(
    async (changedData, imageFile, setUploadProgress, setIsUploading) => {
      if (Object.keys(changedData).length === 0 && !imageFile) {
        toast.info("No changes to save.");
        setIsEditProductOpen(false);
        setProductToEdit(null);
        return;
      }

      setLoading(true);
      try {
        if (!productToEdit?._id && !productToEdit?.id) {
          throw new Error("Product ID is missing");
        }
        const productId = productToEdit._id || productToEdit.id;
        let finalUpdateData = { ...changedData };

        if (imageFile) {
          setIsUploading(true);
          setUploadProgress(0);
          toast.info("Uploading new image...");

          const uploadResponse = await uploadImage(imageFile, (progress) => {
            setUploadProgress(progress);
          });

          finalUpdateData.imageUrl = uploadResponse.imageUrl;
          setIsUploading(false);
        }

        await updateProduct(productId, finalUpdateData);
        toast.success("Product Updated");
        setIsEditProductOpen(false);
        setProductToEdit(null);
        await refreshProducts();

        if (
          statsRefreshCallbackRef.current &&
          (finalUpdateData.status || finalUpdateData.isArchived !== undefined)
        ) {
          statsRefreshCallbackRef.current();
        }
      } catch (error) {
        console.error("Failed to update product:", error);
        toast.error(error.message || "Failed to update product");
        setLoading(false);
        if (setIsUploading) setIsUploading(false);
        throw error;
      }
    },
    [productToEdit, refreshProducts, setLoading]
  );

  const handleRegisterStatsRefresh = useCallback((callback) => {
    statsRefreshCallbackRef.current = callback;
  }, []);

  const outletContext = useMemo(
    () => ({
      onAddNew: handleAddProduct,
      onEdit: handleEditProduct,
      onRegisterStatsRefresh: handleRegisterStatsRefresh,
    }),
    [handleAddProduct, handleEditProduct, handleRegisterStatsRefresh]
  );

  return (
    <div className="min-h-[95vh] w-full overflow-x-hidden bg-gradient-to-br from-emerald-50/30 to-teal-50/30">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="group fixed bottom-6 right-6 z-[500] rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 p-4 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl lg:hidden"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[499] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Dashboard Container */}
      <div className="mx-auto flex w-full max-w-[1920px] gap-6 p-6 lg:gap-8">
        {/* Sidebar */}
        <DashboardSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <main className="w-full flex-1 overflow-x-hidden rounded-2xl border border-emerald-100/70 bg-white/80 shadow-lg backdrop-blur-sm lg:w-auto">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Lazy-loaded Modals */}
      {isAddProductOpen && (
        <Suspense fallback={null}>
          <AddProduct
            isOpen={isAddProductOpen}
            onClose={() => setIsAddProductOpen(false)}
            onSubmit={handleAddProductSubmit}
          />
        </Suspense>
      )}

      {isEditProductOpen && (
        <Suspense fallback={null}>
          <EditProduct
            isOpen={isEditProductOpen}
            onClose={() => {
              setIsEditProductOpen(false);
              setProductToEdit(null);
            }}
            onSubmit={handleEditProductSubmit}
            product={productToEdit}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Dashboard;
