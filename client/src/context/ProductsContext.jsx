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

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMyProducts();
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
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refreshProducts = () => {
    fetchProducts();
  };

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    setLoading,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
