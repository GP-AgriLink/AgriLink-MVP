import { useState, useEffect } from "react";

const OrderCard = ({ order, onOrderUpdate }) => {
  const [fadeOut, setFadeOut] = useState(false);
  // Use the 'order' prop directly as formatted by OrdersPage
  const orderData = order;

  const initialStatus = orderData.status === "Ready for Delivery" ? "Delivery" : orderData.status;
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (orderData.status === "Ready for Delivery") setStatus("Delivery");
    else setStatus(orderData.status);
  }, [orderData.status]);

  const formatNumber = (num) => (typeof num === "number" && !isNaN(num) ? num.toFixed(2) : "0.00");

  const handleClick = async (newStatus) => {
    // --- ADDED THIS CHECK ---
    // If the new status is the same as the current status, do nothing.
    if (newStatus === status) {
      return;
    }
    // ------------------------

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
    status === "Delivery" ? "bg-gray-50 border-gray-200" : "bg-white border-green-100";

  const items = orderData.items || [];
  const customer = orderData.customer || "Unknown Customer";
  const phone = orderData.phone || "No Phone";
  const total = orderData.total || 0;
  const date = orderData.date;

  return (
    // constrain width so cards don't get too wide on very large screens
    <div
      className={`w-full max-w-[420px] 3xl:max-w-[520px] ${cardStyle} flex flex-col justify-between rounded-2xl border p-5 shadow-lg transition-all duration-300 sm:p-6 ${
        fadeOut ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-gray-500">
            {date
              ? new Date(date).toLocaleDateString("en-GB", { dateStyle: "medium" })
              : "Unknown Date"}
          </p>
          <span className="self-start rounded-md bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 sm:self-auto">
            Total ${formatNumber(total)}
          </span>
        </div>

        <h3
          className={`mb-1 text-left text-lg font-semibold ${
            status === "Delivery" ? "text-green-700" : "text-gray-800"
          }`}
        >
          {status === "Incoming"
            ? "Incoming Order"
            : status === "Delivery"
              ? "Delivery Order"
              : status}
        </h3>

        <p className="pb-1 font-medium text-gray-700">{customer}</p>
        <p className="mb-4 text-sm text-gray-500">{phone}</p>

        <div
          className={`${
            status === "Delivery" ? "border-green-200 bg-gray-100" : "border-green-100 bg-green-50"
          } mb-4 rounded-xl border p-4`}
        >
          <p className="mb-2 text-left text-sm font-semibold tracking-wide text-gray-700">
            Items ({items.length})
          </p>

          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between border-b border-gray-100 py-1 text-sm text-gray-600 last:border-none"
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleClick("Completed")}
          className="w-full rounded-lg border border-[#0EB17C] bg-white py-2.5 font-semibold text-[#0EB17C] shadow-sm transition hover:bg-[#0EB17C] hover:text-white"
        >
          Complete
        </button>
        <button
          onClick={() => handleClick("Delivery")}
          className="w-full rounded-lg bg-[#13C191] py-2.5 font-semibold text-white transition hover:opacity-90"
        >
          Delivery
        </button>
        <button
          onClick={() => handleClick("Cancelled")}
          className="w-full rounded-lg bg-red-100 py-2.5 font-semibold text-red-700 transition hover:bg-red-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
