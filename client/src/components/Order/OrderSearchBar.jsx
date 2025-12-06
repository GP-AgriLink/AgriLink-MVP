import { memo, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useOrders } from "../../context/OrdersContext";
import { useAuth } from "../../context/AuthContext";
import { sanitizeString } from "../../utils/sanitizers";

/**
 * Compact OrderSearchBar - Redesigned for inline use next to order counts
 * Features: Small footprint, modern design, smooth interactions, secure input handling
 * Security: Input sanitization, length limits, XSS prevention
 */
const OrderSearchBar = memo(({ className = "" }) => {
  const { user } = useAuth();
  const { searchInput, setSearchInput, applySearch, clearFilters, activeSearch, searchLoading } =
    useOrders();

  // Security constants
  const MAX_SEARCH_LENGTH = 100;
  const SAFE_SEARCH_PATTERN = /^[a-zA-Z0-9\s\u0621-\u064A-_.]*$/; // Letters, numbers, spaces, Arabic, hyphens, underscores, periods

  /**
   * Sanitizes and validates search input
   * Prevents XSS, injection attacks, and enforces safe characters only
   */
  const sanitizeSearchInput = useCallback((input) => {
    if (!input || typeof input !== "string") return "";

    // 1. Trim whitespace
    let sanitized = input.trim();

    // 2. Enforce maximum length
    sanitized = sanitized.slice(0, MAX_SEARCH_LENGTH);

    // 3. Remove dangerous characters using sanitizer utility
    sanitized = sanitizeString(sanitized);

    // 4. Allow only safe characters (letters, numbers, spaces, common punctuation)
    // Remove any character that doesn't match the safe pattern
    sanitized = sanitized
      .split("")
      .filter((char) => SAFE_SEARCH_PATTERN.test(char))
      .join("");

    return sanitized;
  }, []);

  /**
   * Handles input change with sanitization
   */
  const handleInputChange = useCallback(
    (e) => {
      const rawInput = e.target.value;
      const sanitized = sanitizeSearchInput(rawInput);
      setSearchInput(sanitized);
    },
    [sanitizeSearchInput, setSearchInput]
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmedInput = searchInput.trim();

      // Additional validation before search
      if (trimmedInput.length === 0) {
        if (activeSearch) {
          clearFilters();
        }
        return;
      }

      // Minimum search length (optional - prevents very short searches)
      if (trimmedInput.length < 2) {
        return; // Silently ignore searches less than 2 characters
      }

      applySearch();
    },
    [applySearch, searchInput, activeSearch, clearFilters]
  );

  const handleClearSearch = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClearSearch();
      }
    },
    [handleClearSearch]
  );

  // Compact placeholder based on user role
  const placeholder = user?.role === "farmer" ? "Search customers..." : "Search farms...";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_SEARCH_LENGTH}
            className="w-48 rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-8 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:w-56"
            autoComplete="off"
            spellCheck="false"
            disabled={searchLoading}
            aria-label="Search orders"
            role="searchbox"
          />
          {searchLoading ? (
            <div className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          ) : (
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          )}
          {searchInput && !searchLoading && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!searchInput.trim() || searchLoading}
          className="rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 p-1.5 text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Active search badge */}
      {activeSearch && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="group inline-flex items-center gap-1 rounded-md bg-emerald-100 py-1 pl-2 pr-1.5 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition-colors hover:bg-emerald-200"
          title="Clear search"
        >
          <span className="max-w-[80px] truncate">{activeSearch}</span>
          <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
        </button>
      )}
    </div>
  );
});

OrderSearchBar.displayName = "OrderSearchBar";

export default OrderSearchBar;
