import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMyProducts } from "../services/farmProductApi";
import { useAuth } from "./AuthContext";

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
    category: "",
    search: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Debounce the search term
  const debouncedSearch = useDebounce(pagination.search, 300);

  useEffect(() => {
    if (!user) {
      setProductsData({ data: [], page: 1, pages: 1, total: 0 });
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass all pagination params to the API call
        const data = await getMyProducts(
          pagination.page,
          pagination.limit,
          pagination.category,
          debouncedSearch // Use the debounced search term
        );
        setProductsData(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, pagination.page, pagination.limit, pagination.category, debouncedSearch]); // Re-fetch when debouncedSearch changes

  /**
   * Manually re-runs the fetch with the current pagination settings.
   * Useful for refreshing data after a create, update, or delete action.
   */
  const refreshProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProducts(
        pagination.page,
        pagination.limit,
        pagination.category,
        debouncedSearch
      );
      setProductsData(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [user, pagination, debouncedSearch]);

  const goToPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Renamed to setCategoryFilter for clarity
  const setCategoryFilter = (newCategory) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      category: newCategory || "",
    }));
  };

  // New function to update search term
  const setSearchQuery = (newSearch) => {
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to page 1 on new search
      search: newSearch || "",
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
    setFilter: setCategoryFilter,
    setCategoryFilter,
    setSearchQuery,
    activeCategory: pagination.category,
    activeSearch: pagination.search,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
