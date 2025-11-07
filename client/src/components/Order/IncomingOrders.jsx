import { useState, useEffect } from "react";
import OrderCard from "./OrderCard";

const ITEMS_PER_PAGE = 6;

const IncomingOrders = ({ orders, onOrderUpdate, activeFilter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fade, setFade] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = orders.filter((order) =>
      order.items.some((item) => item.name.toLowerCase().includes(lowerTerm))
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setFade(true);
    setTimeout(() => {
      setCurrentPage(page);
      setFade(false);
    }, 300);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {activeFilter === "incoming" ? "Incoming Orders" : "Delivery Orders"}
        </h2>

        {/* Search + Counter row */}
        <div className="flex items-center gap-3 justify-center sm:justify-end">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
            {filteredOrders.length} Active
          </span>
        </div>
      </div>

      {/* Orders Section */}
      {filteredOrders.length > 0 ? (
        <>
          <div
            className={`grid gap-8 justify-items-center grid-cols-1 md:grid-cols-2 xl:grid-cols-2 3xl:grid-cols-3 transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"
              }`}
          >
            {currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} onOrderUpdate={onOrderUpdate} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap mt-6 gap-3">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`px-4 py-2 rounded-md font-semibold transition ${currentPage === idx + 1
                    ? "bg-[#13C191] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-emerald-50 p-8 rounded-xl shadow-sm w-full max-w-md">
            <img
              src="/noOrder_4.svg"
              alt="No orders"
              className="w-[280px] sm:w-[350px] mx-auto opacity-90 object-contain"
            />
            <p className="text-lg font-semibold text-emerald-700 mt-4">No Orders Found.</p>
            <p className="text-sm text-gray-500 mt-2">Try a different item name.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default IncomingOrders;
