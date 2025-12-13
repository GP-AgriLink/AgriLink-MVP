import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getFarmById } from "../services/farmApi.js";
import { getPublicProductsByFarm } from "../services/farmProductApi.js";

// Icons
import { FaSearch, FaTimes } from "react-icons/fa";

import LogoSpinner from "../components/common/LogoSpinner.jsx";
import FarmInfo from "../components/FarmStore/FarmInfo.jsx";
import ProductCard from "../components/FarmStore/ProductCard.jsx";
import Slider from "../components/FarmStore/slider.jsx";

const FarmStorePage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- States ---
  const [farm, setFarm] = useState(null);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Loaders
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Pagination
  // Initialize page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Search & Filter
  // 1. searchTerm: Input text state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  // 2. activeSearch: The actual search query sent to API
  const [activeSearch, setActiveSearch] = useState(searchParams.get("search") || "");

  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.getAll("category") || []
  );

  const sidebarRef = useRef();
  const productsGridRef = useRef(null);

  // 1. Initial Fetch (Farm Data + Categories)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [farmData, allProductsData] = await Promise.all([
          getFarmById(id),
          getPublicProductsByFarm(id, { limit: 1000 }),
        ]);

        setFarm(farmData);

        const allProds = allProductsData.data || [];
        const cats = allProds.map((p) => p.category).filter((cat) => cat);
        setAllCategories([...new Set(cats)]);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2. Products Fetch (Depends on activeSearch)
  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (activeSearch) params.search = activeSearch;

        if (selectedCategories.length > 0) {
          params.category = selectedCategories[0];
        }

        const productsData = await getPublicProductsByFarm(id, params);

        setProducts(productsData.data || []);
        setTotalPages(productsData.pages || 1);

        // Update URL
        const urlParams = new URLSearchParams();
        // Add page to URL if not on page 1
        if (currentPage > 1) urlParams.append("page", currentPage);
        if (activeSearch) urlParams.append("search", activeSearch);
        selectedCategories.forEach((cat) => urlParams.append("category", cat));
        setSearchParams(urlParams, { replace: true });
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    };

    if (id) fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentPage, activeSearch, selectedCategories]);

  // --- Handlers ---

  const handleSearch = (e) => {
    if (e) e.preventDefault(); // Prevent form submission if inside a form
    setActiveSearch(searchTerm.trim());
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear function: clears input, resets active search, resets page
  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (productsGridRef.current) {
        productsGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const toggleCategory = (cat) => {
    setCurrentPage(1);
    if (cat === "All") {
      setSelectedCategories([]);
    } else {
      if (selectedCategories.includes(cat)) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories([cat]);
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // --- Render ---

  if (isLoading && !farm) {
    return (
      <div className="relative min-h-screen">
        <LogoSpinner message="Loading store..." />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#F8FFFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Slider */}
        {farm && <Slider key={farm._id} farm={farm} products={products} />}

        {/* --- NEW SEARCH INPUT SECTION --- */}
        <div className="mb-8 mt-12 flex">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-full border border-gray-300 px-6 py-4 pr-24 text-lg caret-[#008c7a] shadow-lg focus:border-[#008c7a] focus:outline-none focus:ring-1 focus:ring-[#008c7a]"
            />

            {/* Clear Button (Visible only when there is text) */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-red-500"
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#008c7a] p-3 text-white shadow-md transition-colors hover:bg-[#007a6a]"
            >
              <FaSearch className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
          <motion.button
            key="all"
            onClick={() => toggleCategory("All")}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              selectedCategories.length === 0
                ? "border-[#008c7a] bg-[#008c7a] text-white shadow"
                : "border-[#84dcc6] bg-white text-[#008c7a] hover:bg-[#e6fcf7]"
            }`}
          >
            All
          </motion.button>

          {allCategories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                selectedCategories.includes(cat)
                  ? "border-[#008c7a] bg-[#008c7a] text-white shadow"
                  : "border-[#84dcc6] bg-white text-[#008c7a] hover:bg-[#e6fcf7]"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Products Grid Section */}
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-12" ref={productsGridRef}>
          <main className="relative min-h-[400px] lg:col-span-8">
            {/* Centered Loader Overlay */}
            {isProductsLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm transition-all duration-300">
                <LogoSpinner message="Updating..." />
              </div>
            ) : null}

            {!isProductsLoading && products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-white py-16 text-center"
              >
                <h3 className="mb-2 text-xl font-bold text-[#0a3832]">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No products available"}
                </h3>
                {activeSearch && (
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-sm text-gray-500 underline hover:text-[#008c7a]"
                  >
                    Clear search
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div
                  className={`grid grid-cols-1 gap-8 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 ${isProductsLoading ? "opacity-20" : "opacity-100"}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                >
                  {products.map((p) => (
                    <motion.div key={p._id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ProductCard product={{ ...p, farmData: farm }} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* --- Pagination Controls --- */}
                {!isProductsLoading && totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "border border-[#84dcc6] bg-white text-[#008c7a] shadow hover:bg-[#e6fcf7]"
                      }`}
                    >
                      &laquo; Prev
                    </button>

                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "border-[#008c7a] bg-[#008c7a] text-white"
                            : "border-[#84dcc6] bg-white text-[#008c7a] hover:bg-[#e6fcf7]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "border border-[#84dcc6] bg-white text-[#008c7a] shadow hover:bg-[#e6fcf7]"
                      }`}
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          <motion.aside className="mt-12 lg:col-span-4 lg:mt-0">
            {farm && <FarmInfo farm={farm} />}
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
};

export default FarmStorePage;
