import { useState } from "react";
import OrderCard from "./OrderCard";

const ITEMS_PER_PAGE = 6;

const IncomingOrders = ({ orders, onOrderUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fade, setFade] = useState(false);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setFade(true);
    setTimeout(() => {
      setCurrentPage(page);
      setFade(false);
    }, 300);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Incoming Orders
        </h2>
        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
          {orders.length} Active
        </span>
      </div>

      {orders.length > 0 ? (
        <>
          <div
            className={`grid gap-8 justify-items-center grid-cols-1 md:grid-cols-2 xl:grid-cols-2 3xl:grid-cols-3 transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"
              }`}
          >
            {currentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOrderUpdate={onOrderUpdate}
              />
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
          <div className = "flex flex-col items-center justify-center py-10 text-center">
          <div className = "bg-emerald-50 p-8 rounded-xl shadow-sm w-full max-w-md">
            <img
              src = "/noOrder_4.svg"
              alt = "No orders"
              className = "w-[280px] sm:w-[350px] mx-auto opacity-90 object-contain"
            />
      <p className="text-lg font-semibold text-emerald-700 mt-4">
        No Orders Right Now.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Everything looks calm for now.
      </p>
    </div>
        </div >
      )}
    </section >
  );
};

export default IncomingOrders;