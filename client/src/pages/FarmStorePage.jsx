import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient, { API_ENDPOINTS } from "../config/api.js";
import FarmInfo from "../components/FarmStore/FarmInfo.jsx";
import ProductCard from "../components/FarmStore/ProductCard.jsx";
import Slider from "../components/FarmStore/slider.jsx";

const FarmStorePage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [farm, setFarm] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.getAll("category") || []
  );

  const sidebarRef = useRef();

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [farmRes, productRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.farms.byId(id)),
          apiClient.get(`${API_ENDPOINTS.products.publicByFarm(id)}`),
        ]);

        setFarm(farmRes.data);
        const productData = productRes.data;
        setProducts(Array.isArray(productData.data) ? productData.data : []);

        const cats = productData.data.flatMap((p) => p.categories || []);
        setAllCategories([...new Set(cats)]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    searchParams.delete("category");
    selectedCategories.forEach((cat) => searchParams.append("category", cat));
    setSearchParams(searchParams);
  }, [selectedCategories]);

  const displayedProducts = products
    .filter((p) =>
      selectedCategories.length === 0
        ? true
        : p.categories?.some((cat) => selectedCategories.includes(cat))
    )
    .filter((p) =>
      debouncedSearch ? p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) : true
    );

  const toggleCategory = (cat) => {
    if (cat === "All") {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
    }
  };

  const openSidebar = () => {
    if (sidebarRef.current) sidebarRef.current.style.transform = "translateX(0)";
  };
  const closeSidebar = () => {
    if (sidebarRef.current) sidebarRef.current.style.transform = "translateX(-100%)";
  };

  return (
    <motion.div
      className="min-h-screen bg-[#F8FFFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {farm && <Slider key={farm._id} farm={farm} products={displayedProducts} />}

        <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search product by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#84dcc6] px-4 py-2 text-gray-700 shadow-sm focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f] sm:w-1/2"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <motion.button
            key="all"
            onClick={() => toggleCategory("All")}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`rounded-full border px-3 py-1 text-sm ${
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`rounded-full border px-3 py-1 text-sm ${
                selectedCategories.includes(cat)
                  ? "border-[#008c7a] bg-[#008c7a] text-white shadow"
                  : "border-[#84dcc6] bg-white text-[#008c7a] hover:bg-[#e6fcf7]"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-12">
          <main className="lg:col-span-8">
            {displayedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl bg-white py-16 text-center"
              >
                <h3 className="mb-2 text-xl font-bold text-[#0a3832]">
                  {debouncedSearch ? "No results found" : "No products to show yet"}
                </h3>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
              >
                {displayedProducts.map((p) => (
                  <motion.div key={p._id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>

          <motion.aside
            ref={sidebarRef}
            className="mt-12 lg:col-span-4 lg:mt-0"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FarmInfo farm={farm} />
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
};

export default FarmStorePage;
