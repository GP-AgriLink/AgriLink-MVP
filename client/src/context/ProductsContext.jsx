import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMyProducts } from "../services/farmProductApi";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const ProductsContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const ProductsProvider = ({ children }) => {
  // State now holds the entire pagination object from the server
  const [productsData, setProductsData] = useState({
    data: [],
    page: 1,
    pages: 1,
    total: 0,
  });
  // State to manage the query parameters (page, limit, category)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    filter: "active",
    search: "",
    category: "",
  });

  // Separate state for input values before applying
  const [searchInput, setSearchInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProductsData({ data: [], page: 1, pages: 1, total: 0 });
      setLoading(false);
      return;
    }

    // Only fetch products if user is a farmer
    if (user.role !== "farmer") {
      setProductsData({ data: [], page: 1, pages: 1, total: 0 });
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build params object for the API call
        const params = {
          page: pagination.page,
          limit: pagination.limit,
        };

        // Add search if it exists
        if (pagination.search) {
          params.search = pagination.search;
        }

        // Add category if it exists
        if (pagination.category) {
          params.category = pagination.category;
        }

        if (pagination.filter === "archived") {
          // Only send isArchived when it's true
          params.isArchived = true;
        } else if (pagination.filter) {
          // For 'active' or 'inactive', only send status 
          params.status = pagination.filter;
        }

        // Actually call the API with the params
        const data = await getMyProducts(params);

        setProductsData(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        
        // Handle auth errors strictly
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(err.message || "Authentication required");
        } else {
          // For network errors or server down, show toast and empty state
          if (!err.response || err.code === "ERR_NETWORK") {
            toast.error("Network error. Please check your connection.");
          }
          // Set empty data for graceful degradation
          setProductsData({ data: [], page: 1, pages: 1, total: 0 });
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, pagination.page, pagination.limit, pagination.filter, pagination.search, pagination.category]); // Re-fetch when search or category changes

  /**
   * Manually re-runs the fetch with the current pagination settings.
   * Useful for refreshing data after a create, update, or delete action.
   */
  const refreshProducts = useCallback(async () => {
    if (!user) return;
    
    // Only refresh products if user is a farmer
    if (user.role !== "farmer") {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (pagination.search) {
        params.search = pagination.search;
      }

      if (pagination.category) {
        params.category = pagination.category;
      }

      if (pagination.filter === "archived") {
        // Only send isArchived when it's true
        params.isArchived = true;
      } else if (pagination.filter) {
        // For 'active' or 'inactive', only send status
        params.status = pagination.filter;
      }

      const data = await getMyProducts(params);

      setProductsData(data);
    } catch (err) {
      // Handle errors gracefully like in fetchProducts
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.message || "Authentication required");
      } else {
        if (!err.response || err.code === "ERR_NETWORK") {
          toast.error("Network error. Please check your connection.");
        }
        setProductsData({ data: [], page: 1, pages: 1, total: 0 });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, pagination]);

  const goToPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Renamed to setFilter
  const setFilter = (newFilter) => {
    // Clear search and category filters when switching status tabs
    setSearchInput("");
    setCategoryInput("");
    setPagination((prev) => ({
      ...prev,
      page: 1,
      filter: newFilter || "active",
      search: "",
      category: "",
    }));
  };

  // Function to apply search filter (triggered by button click)
  const applyFilters = () => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      search: searchInput.trim(),
    }));
  };

  // Function to set category immediately (on dropdown change)
  const setCategoryFilter = (newCategory) => {
    setCategoryInput(newCategory);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      category: newCategory,
    }));
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setCategoryInput("");
    setPagination((prev) => ({
      ...prev,
      page: 1,
      search: "",
      category: "",
    }));
  };

  const value = {
    products: productsData.data,
    loading,
    error,
    refreshProducts,
    setLoading,
    page: productsData.page,
    totalPages: productsData.pages,
    totalProducts: productsData.total,
    goToPage,
    setFilter,
    activeFilter: pagination.filter,
    activeSearch: pagination.search,
    activeCategory: pagination.category,
    searchInput,
    setSearchInput,
    categoryInput,
    setCategoryInput,
    applyFilters,
    setCategoryFilter,
    clearFilters,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
