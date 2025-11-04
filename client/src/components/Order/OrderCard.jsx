import { useState, useEffect } from "react";

const OrderCard = ({ order, onOrderUpdate }) => {
  const [fadeOut, setFadeOut] = useState(false);
  // Use the 'order' prop directly as formatted by OrdersPage
  const orderData = order;

  const initialStatus =
    orderData.status === "Ready for Delivery" ? "Delivery" : orderData.status;
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (orderData.status === "Ready for Delivery") setStatus("Delivery");
    else setStatus(orderData.status);
  }, [orderData.status]);

  const formatNumber = (num) =>
    typeof num === "number" && !isNaN(num) ? num.toFixed(2) : "0.00";

  const handleClick = async (newStatus) => {
    if (newStatus === "Delivery") {
      setStatus("Delivery");
      try {
        // Use the new status "Ready for Delivery" when "Delivery" button is clicked
        await onOrderUpdate(orderData.id, "Ready for Delivery");
      } catch (err) {
        console.error("Failed to update order:", err);
        alert("Failed to update order status. Please try again.");
        // Revert UI on failure
        setStatus(orderData.status);
      }
    } else {
      setFadeOut(true);
      setTimeout(async () => {
        try {
          await onOrderUpdate(orderData.id, newStatus);
          // On success, parent (OrdersPage) will handle state removal
        } catch (err) {
          console.error("Failed to update order:", err);
          alert("Failed to update order status. Please try again.");
          // Revert fadeout on failure
          setFadeOut(false);
        }
      }, 300);
    }
  };

  const cardStyle =
    status === "Delivery"
      ? "bg-gray-50 border-gray-200"
      : "bg-white border-green-100";

  const items = orderData.items || [];
  const customer = orderData.customer || "Unknown Customer";
  const phone = orderData.phone || "No Phone";
  const total = orderData.total || 0;
  const date = orderData.date;

  return (
    // constrain width so cards don't get too wide on very large screens
    <div
      className={`w-full max-w-[420px] 3xl:max-w-[520px] ${cardStyle} shadow-lg rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between border ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <p className="text-sm text-gray-500 font-medium">
            {date
              ? new Date(date).toLocaleDateString("en-GB", { dateStyle: "medium" })
              : "Unknown Date"}
          </p>
          <span className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-md font-semibold self-start sm:self-auto">
            Total ${formatNumber(total)}
          </span>
        </div>

        <h3
          className={`font-semibold text-left text-lg mb-1 ${status === "Delivery" ? "text-green-700" : "text-gray-800"
            }`}
        >
          {status === "Incoming"
            ? "Incoming Order"
            : status === "Delivery"
              ? "Delivery Order"
              : status}
        </h3>

        <p className="text-gray-700 font-medium pb-1">{customer}</p>
        <p className="text-sm text-gray-500 mb-4">{phone}</p>

        <div
          className={`${status === "Delivery"
            ? "bg-gray-100 border-green-200"
            : "bg-green-50 border-green-100"
            } rounded-xl p-4 mb-4 border`}
        >
          <p className="text-sm font-semibold text-left text-gray-700 mb-2 tracking-wide">
            Items ({items.length})
          </p>

          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100 last:border-none"
            >
              <div className="flex flex-col text-left">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-gray-500">
                  {item.qty} pcs × ${formatNumber(item.price)}
                </span>
              </div>
              <span className="font-semibold text-gray-700">
                ${formatNumber(item.qty * item.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleClick("Completed")}
          className="w-full bg-white text-[#0EB17C] py-2.5 rounded-lg font-semibold border border-[#0EB17C] shadow-sm hover:bg-[#0EB17C] hover:text-white transition"
        >
          Complete
        </button>
        <button
          onClick={() => handleClick("Delivery")}
          className="w-full bg-[#13C191] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Delivery
        </button>
        <button
          onClick={() => handleClick("Cancelled")}
          className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg font-semibold hover:bg-red-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OrderCard;