import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import AddProduct from "../components/FarmProduct/AddProduct";
import EditProduct from "../components/FarmProduct/EditProduct";
import { uploadImage } from "../services/uploadService";
import { createProduct, updateProduct } from "../services/farmProductApi";
import { useProducts } from "../context/ProductsContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Modal State & Logic Lives Here ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { setLoading, refreshProducts } = useProducts();

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

  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsEditProductOpen(true);
  };

  const handleAddProductSubmit = async (sanitizedData, imageFile) => {
    setLoading(true); // Use context's loading
    let finalData = { ...sanitizedData };

    try {
      if (imageFile) {
        toast.info("Uploading image...");
        const uploadResponse = await uploadImage(imageFile);
        finalData.imageUrl = uploadResponse.imageUrl;
      }

      await createProduct(finalData);
      toast.success("Product Created");
      setIsAddProductOpen(false);
      refreshProducts(); // This will set loading to false
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error(error.message || "Failed to create product");
      setLoading(false); // Manually stop loading on error
      throw error; // Re-throw to keep the modal open
    }
  };

  const handleEditProductSubmit = async (changedData, imageFile) => {
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
        toast.info("Uploading new image...");
        const uploadResponse = await uploadImage(imageFile);
        finalUpdateData.imageUrl = uploadResponse.imageUrl;
      }

      await updateProduct(productId, finalUpdateData);

      toast.success("Product Updated");
      setIsEditProductOpen(false);
      setProductToEdit(null);
      refreshProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error(error.message || "Failed to update product");
      setLoading(false);
      throw error;
    }
  };

  return (
    <div className="box-border" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed bottom-6 right-6 z-[500] rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 p-4 text-white shadow-lg transition-all hover:shadow-xl lg:hidden"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-[500] bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Component */}
          <DashboardSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

          <main className="max-h-fit flex-1">
            <div className="max-h-[90vh] min-h-fit overflow-auto rounded-2xl border border-emerald-100/70 bg-white/80 shadow-lg backdrop-blur-sm">
              {/* Pass handlers to children via Outlet context */}
              <Outlet context={{ onAddNew: handleAddProduct, onEdit: handleEditProduct }} />
            </div>
          </main>
        </div>
      </div>

      {/* Modals are rendered here, outside the <main> element,
          so they can cover the entire page */}
      <AddProduct
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProductSubmit}
      />

      <EditProduct
        isOpen={isEditProductOpen}
        onClose={() => {
          setIsEditProductOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleEditProductSubmit}
        product={productToEdit}
      />
    </div>
  );
};

export default Dashboard;
