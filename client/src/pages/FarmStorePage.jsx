import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../config/api.js";
import FarmInfo from "../components/FarmStore/FarmInfo.jsx";
import ProductCard from "../components/FarmStore/ProductCard.jsx";
import Slider from "../components/FarmStore/slider.jsx";

const FarmStorePage = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [farm, setFarm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [farmRes, productRes] = await Promise.all([
          apiClient.get(`/api/farms/${id}`),
          apiClient.get(`/api/products/farm/${id}`),
        ]);

        setFarm(farmRes.data);
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load farm data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchFarmData();
  }, [id]);

  // === Loader ===
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FFFC]">
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="w-12 h-12 rounded-full grid place-items-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-lg z-10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.5 3.75c5.25.75 9 5.25 9.75 9.75.75-4.5 4.5-9 9.75-9.75-.75 5.25-3.75 9-9.75 11.25 2.25 1.5 5.25 3.75 6 6-4.5-1.5-7.5-3.75-9-6-1.5 2.25-4.5 4.5-9 6 .75-2.25 3.75-4.5 6-6C8.25 12.75 5.25 9 4.5 3.75Z"></path>
            </svg>
          </span>

          <motion.span
            className="absolute w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          ></motion.span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FFFC]">
        <h3 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // === Pagination Logic ===
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  // === Main Page ===
  return (
    <motion.div
      className="bg-[#F8FFFC] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {farm && (
          <div className="mb-12">
            <Slider key={farm._id} />
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold text-[#0a3832] capitalize">
              {farm ? `Shop ${farm.farmName}'s harvest` : ""}
            </h2>
            <p className="text-md text-[#4a7c6f] mt-1">
              Add items to your basket and we'll coordinate a climate-friendly
              delivery window.
            </p>
          </div>

          {/* Product Count Tag */}
          <span
            className="
              text-xs font-semibold uppercase tracking-wider
              px-3 py-1.5
              rounded-full
              self-start sm:self-center
              text-[#008c7a]
              bg-[#e6fcf7]
              border border-[#84dcc6]
            "
          >
            {products.length} Products
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 mt-8">
          {/* Products Section */}
          <main className="lg:col-span-8">
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16 bg-white rounded-2xl shadow-xl border border-[#84dcc6]"
              >
                <h3 className="text-xl font-bold text-[#0a3832] mb-2">
                  No products to show yet
                </h3>
                <p className="text-base text-[#4a7c6f]">
                  Please check back later for fresh items from this farm.
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={currentPage}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      farm={farm}
                    />
                  ))}
                </motion.div>

                {totalPages > 0 && (
                  <motion.div
                    key={`pagination-${currentPage}`}
                    className="flex justify-center mt-10 space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-full border border-[#84dcc6] text-[#008c7a] hover:bg-[#e6fcf7] disabled:opacity-50"
                    >
                      Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-full border ${
                          currentPage === i + 1
                            ? "bg-[#008c7a] text-white"
                            : "border-[#84dcc6] text-[#008c7a] hover:bg-[#e6fcf7]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-full border border-[#84dcc6] text-[#008c7a] hover:bg-[#e6fcf7] disabled:opacity-50"
                    >
                      Next
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </main>

          {/* Farm Info Sidebar */}
          <motion.aside
            className="lg:col-span-4 mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <FarmInfo farm={farm} />
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
};

export default FarmStorePage;
