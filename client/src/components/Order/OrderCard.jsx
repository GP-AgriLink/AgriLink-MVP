import { useState } from "react";
import {
  Package,
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";

/**
 * OrderCard
 * Displays a single incoming order with details and actions.
 * @param {Object} order - The full order object from the server
 * @param {Function} onOrderUpdate - (id, newStatus) => {}
 */
const OrderCard = ({ order, onOrderUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(null); // 'Completed' or 'Cancelled'

  // Extract data from the order prop
  const {
    _id: id,
    customerName,
    customerPhone,
    orderItems,
    totalAmount,
    createdAt,
  } = order;

  const orderDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleAction = async (newStatus) => {
    setIsSubmitting(newStatus);
    try {
      await onOrderUpdate(id, newStatus);
    } catch (err) {
      // Error is handled by service/page, just reset submitting state
      setIsSubmitting(null);
    }
    // On success, the component will be removed by the parent
  };

  const isActionDisabled = !!isSubmitting;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Card Header */}
      <div
        className="px-4 py-3 sm:px-5 flex justify-between items-center cursor-pointer border-b border-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
            <Package size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base sm:text-lg">
              {customerName}
            </h3>
            <p className="text-sm text-gray-500">
              Total:{" "}
              <span className="font-medium text-gray-700">
                ${totalAmount.toFixed(2)} {/* UPDATED */}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={14} />
            {orderDate}
          </span>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""
              }`}
          />
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="px-4 py-4 sm:px-5 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <InfoItem icon={User} label="Customer" value={customerName} />
            <InfoItem icon={Phone} label="Phone" value={customerPhone} />
            <InfoItem icon={Calendar} label="Date" value={orderDate} />
          </div>

          <hr className="my-4" />

          {/* Order Items */}
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Order Items
          </h4>
          <ul className="space-y-2">
            {orderItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-500 ml-2">
                    (x{item.quantity})
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  ${(item.unitPrice * item.quantity).toFixed(2)} {/* UPDATED */}
                </span>
              </li>
            ))}
            <li className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span> {/* UPDATED */}
            </li>
          </ul>
        </div>
      )}

      {/* Card Footer (Actions) */}
      <div className="px-4 py-3 sm:px-5 bg-gray-50/70 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => handleAction("Completed")}
          disabled={isActionDisabled}
          className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md font-semibold text-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting === "Completed" ? (
            <Spinner />
          ) : (
            <CheckCircle size={16} />
          )}
          Mark as Completed
        </button>
        <button
          onClick={() => handleAction("Cancelled")}
          disabled={isActionDisabled}
          className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md font-semibold text-sm transition hover:bg-red-600 disabled:opacity-50"
        >
          {isSubmitting === "Cancelled" ? <Spinner /> : <XCircle size={16} />}
          Cancel Order
        </button>
      </div>
    </div>
  );
};

// Helper components for Card
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default OrderCard;