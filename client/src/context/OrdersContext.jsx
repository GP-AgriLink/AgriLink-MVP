import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { getMyOrders } from "../services/orderApi";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const OrdersContext = createContext(null);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  // State holds the entire pagination object from the server
  const [ordersData, setOrdersData] = useState({
    data: [],
    page: 1,
    pages: 1,
    total: 0,
  });

  // Query parameters (page, limit, status, search)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    status: "", // empty means all statuses
    search: "",
  });

  // Separate state for input values before applying
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false); // Separate loading for search
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Client-side cache with 2-minute TTL
  const cacheRef = useRef(new Map());
  const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setOrdersData({ data: [], page: 1, pages: 1, total: 0 });
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
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
          setSearchLoading(true); // Indicate search in progress
        }

        // Add status filter if it exists
        if (pagination.status) {
          params.status = pagination.status;
        }

        // Check cache first
        const cacheKey = JSON.stringify({
          page: params.page,
          limit: params.limit,
          search: params.search,
          status: params.status,
        });
        const cached = cacheRef.current.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < CACHE_TTL) {
          setOrdersData(cached.data);
          setLoading(false);
          setSearchLoading(false);
          return;
        }

        // Call the API with the params
        const data = await getMyOrders(params);

        // Cache the response
        cacheRef.current.set(cacheKey, {
          data,
          timestamp: now,
        });

        // Clean old cache entries (keep only last 10)
        if (cacheRef.current.size > 10) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }

        setOrdersData(data);
      } catch (err) {
        console.error("Error fetching orders:", err);

        // Handle auth errors strictly
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(err.message || "Authentication required");
        } else {
          // For network errors or server down, show toast and empty state
          if (!err.response || err.code === "ERR_NETWORK") {
            toast.error("Network error. Please check your connection.");
          }
          // Set empty data for graceful degradation
          setOrdersData({ data: [], page: 1, pages: 1, total: 0 });
          setError(null);
        }
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    fetchOrders();

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [user, pagination.page, pagination.limit, pagination.status, pagination.search]);

  /**
   * Manually re-runs the fetch with the current pagination settings.
   * Useful for refreshing data after an update action.
   */
  const refreshOrders = useCallback(async () => {
    if (!user) return;

    // Clear cache on manual refresh
    cacheRef.current.clear();

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

      if (pagination.status) {
        params.status = pagination.status;
      }

      const data = await getMyOrders(params);

      setOrdersData(data);
    } catch (err) {
      // Handle errors gracefully
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.message || "Authentication required");
      } else {
        if (!err.response || err.code === "ERR_NETWORK") {
          toast.error("Network error. Please check your connection.");
        }
        setOrdersData({ data: [], page: 1, pages: 1, total: 0 });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, pagination]);

  const goToPage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const setStatusFilter = useCallback((newStatus) => {
    // Clear search when switching status tabs
    setSearchInput("");
    setPagination((prev) => ({
      ...prev,
      page: 1,
      status: newStatus || "",
      search: "",
    }));
  }, []);

  // Function to apply search filter (triggered by button click or Enter)
  const applySearch = useCallback(() => {
    const trimmedSearch = searchInput.trim();
    if (!trimmedSearch) return; // Don't apply empty search

    setPagination((prev) => ({
      ...prev,
      page: 1,
      search: trimmedSearch,
      // Preserve existing status filter when searching
    }));
  }, [searchInput]);

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    setSearchInput("");
    setPagination((prev) => ({
      ...prev,
      page: 1,
      search: "",
    }));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      orders: ordersData.data,
      loading,
      searchLoading,
      error,
      refreshOrders,
      setLoading,
      page: ordersData.page,
      totalPages: ordersData.pages,
      totalOrders: ordersData.total,
      goToPage,
      setStatusFilter,
      activeStatus: pagination.status,
      activeSearch: pagination.search,
      searchInput,
      setSearchInput,
      applySearch,
      clearFilters,
    }),
    [
      ordersData.data,
      ordersData.page,
      ordersData.pages,
      ordersData.total,
      loading,
      searchLoading,
      error,
      pagination.status,
      pagination.search,
      searchInput,
      refreshOrders,
      goToPage,
      setStatusFilter,
      applySearch,
      clearFilters,
    ]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};
