import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrdersPage from "./OrdersPage";
import MyProductsPage from "./FarmProductsPage";
import ProfilePage from "./ProfilePage";
import AddProduct from "../components/FarmProduct/AddProduct";
import EditProduct from "../components/FarmProduct/EditProduct";
import { createProduct, updateProduct } from "../services/farmProductApi";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for main component view
  const [activeView, setActiveView] = useState(() => {
    if (location.state?.activeView) {
      return location.state.activeView;
    }
    return localStorage.getItem("dashboardActiveView") || "profile";
  });

  // State for accordion
  const [openAccordion, setOpenAccordion] = useState(() => {
    return localStorage.getItem("dashboardOpenAccordion") || "";
  });

  // State for sub-filter
  const [activeFilter, setActiveFilter] = useState(() => {
    return localStorage.getItem("dashboardActiveFilter") || null;
  });

  const lastNavStateRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    if (location.state?.activeView && location.state.activeView !== lastNavStateRef.current) {
      setActiveView(location.state.activeView);
      // Also set accordion and default filter when navigating from navbar
      if (location.state.activeView === "orders") {
        setOpenAccordion("orders");
        setActiveFilter("incoming");
      } else if (location.state.activeView === "products") {
        setOpenAccordion("products");
        setActiveFilter("active");
      } else {
        setOpenAccordion("");
        setActiveFilter(null);
      }
      lastNavStateRef.current = location.state.activeView;
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleViewChange = (event) => {
      const { activeView } = event.detail;
      if (activeView) {
        setActiveView(activeView);
        // Also set accordion and default filter
        if (activeView === "orders") {
          setOpenAccordion("orders");
          setActiveFilter("incoming");
        } else if (activeView === "products") {
          setOpenAccordion("products");
          setActiveFilter("active");
        } else {
          setOpenAccordion("");
          setActiveFilter(null);
        }
      }
    };

    window.addEventListener("dashboardViewChange", handleViewChange);
    return () => {
      window.removeEventListener("dashboardViewChange", handleViewChange);
    };
  }, []);

  // Save all states to localStorage
  useEffect(() => {
    localStorage.setItem("dashboardActiveView", activeView);
    if (openAccordion) {
      localStorage.setItem("dashboardOpenAccordion", openAccordion);
    } else {
      localStorage.removeItem("dashboardOpenAccordion");
    }
    if (activeFilter) {
      localStorage.setItem("dashboardActiveFilter", activeFilter);
    } else {
      localStorage.removeItem("dashboardActiveFilter");
    }
  }, [activeView, openAccordion, activeFilter]);

  // Effect to disable navbar sticky behavior when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      // Add class to body to indicate sidebar is open
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

  const handleAddProductSubmit = async (productData) => {
    try {
      await createProduct(productData);
      setIsAddProductOpen(false);
      if (window.refreshProducts) {
        window.refreshProducts();
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  };

  const handleEditProductSubmit = async (productData) => {
    try {
      if (!productToEdit?._id && !productToEdit?.id) {
        throw new Error("Product ID is missing");
      }
      const productId = productToEdit._id || productToEdit.id;
      await updateProduct(productId, productData);
      setIsEditProductOpen(false);
      setProductToEdit(null);
      if (window.refreshProducts) {
        window.refreshProducts();
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  const renderActiveComponent = () => {
    switch (activeView) {
      case "orders":
        return (
          <div className="flex min-h-[400px] flex-col py-12 text-center">
            <OrdersPage activeFilter={activeFilter || "incoming"} />
          </div>
        );
      case "products":
        return (
          <div className="min-h-[400px] py-12 text-center">
            <MyProductsPage
              onEdit={handleEditProduct}
              onAddNew={handleAddProduct}
              activeFilter={activeFilter || "active"}
            />
          </div>
        );
      case "profile":
        return (
          <div className="flex min-h-[400px] flex-col py-12 text-center">
            <ProfilePage />
          </div>
        );
      default:
        return (
          <div className="flex min-h-[400px] flex-col py-12 text-center">
            <ProfilePage />
          </div>
        );
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

          {/* New Sidebar Component */}
          <DashboardSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            openAccordion={openAccordion}
            setOpenAccordion={setOpenAccordion}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <main className="max-h-fit flex-1">
            <div className="max-h-[90vh] min-h-fit overflow-auto rounded-2xl border border-emerald-100/70 bg-white/80 shadow-lg backdrop-blur-sm">
              {renderActiveComponent()}
            </div>
          </main>
        </div>
      </div>

      {/* Product Modals */}
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
