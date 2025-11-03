import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrdersPage from './OrdersPage';
import MyProductsPage from './FarmProductsPage';
import ProfilePage from './ProfilePage';
import AddProduct from '../components/FarmProduct/AddProduct';
import EditProduct from '../components/FarmProduct/EditProduct';
import { createProduct, updateProduct } from '../services/farmProductApi';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState(() => {
    if (location.state?.activeView) {
      return location.state.activeView;
    }
    return localStorage.getItem('dashboardActiveView') || 'profile';
  });
  const lastNavStateRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    if (location.state?.activeView && location.state.activeView !== lastNavStateRef.current) {
      setActiveComponent(location.state.activeView);
      lastNavStateRef.current = location.state.activeView;
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleViewChange = (event) => {
      const { activeView } = event.detail;
      if (activeView) {
        setActiveComponent(activeView);
      }
    };

    window.addEventListener('dashboardViewChange', handleViewChange);
    return () => {
      window.removeEventListener('dashboardViewChange', handleViewChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardActiveView', activeComponent);
  }, [activeComponent]);

  // Effect to disable navbar sticky behavior when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      // Add class to body to indicate sidebar is open
      document.body.classList.add('sidebar-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('sidebar-open');
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
      console.error('Failed to create product:', error);
      throw error;
    }
  };

  const handleEditProductSubmit = async (productData) => {
    try {
      if (!productToEdit?._id && !productToEdit?.id) {
        throw new Error('Product ID is missing');
      }
      const productId = productToEdit._id || productToEdit.id;
      await updateProduct(productId, productData);
      setIsEditProductOpen(false);
      setProductToEdit(null);
      if (window.refreshProducts) {
        window.refreshProducts();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: 'orders' },
    { id: 'products', label: 'My Products', icon: 'products' },
    { id: 'profile', label: 'My Profile', icon: 'profile' },
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'orders':
        return (
          <div className="text-center py-12 min-h-[400px] flex flex-col">
            <OrdersPage />
          </div>
        );
      case 'products':
        return (
          <div className="text-center py-12 min-h-[400px]">
            <MyProductsPage 
              onEdit={handleEditProduct}
              onAddNew={handleAddProduct}
            />
          </div>
        );
      case 'profile':
        return (
          <div className="text-center py-12 min-h-[400px] flex flex-col">
            <ProfilePage />
          </div>
        );
      default:
        return (
          <div className="text-center py-12 min-h-[400px] flex flex-col">
            <OrdersPage />
          </div>
        );
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'orders':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        );
      case 'products':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        );
      case 'profile':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5"></circle>
            <path d="M20 21a8 8 0 0 0-16 0"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="box-border" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-[500] p-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
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
              className="lg:hidden fixed inset-0 bg-black/50 z-[500]"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            min-w-72 max-w-80 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/70 p-5 min-h-[90vh] max-h-[90vh] overflow-auto
            lg:relative lg:translate-x-0
            fixed top-0 left-0 h-full z-[500] transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 z-[50]'}
          `}>
            <h2 className="text-sm font-bold text-emerald-800 mb-5 tracking-[4.2px] uppercase" style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif', letterSpacing: '4.2px' }}>
              Farmer Portal
            </h2>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveComponent(item.id);
                    setIsSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all ${activeComponent === item.id
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-md hover:-translate-y-0.5'
                    : 'text-emerald-900 hover:bg-emerald-50'
                    }`}
                >
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 max-h-fit">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/70 overflow-auto min-h-fit max-h-[90vh]">
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
}

export default Dashboard;
