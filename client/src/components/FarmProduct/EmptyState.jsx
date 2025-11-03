
/**
 * EmptyState
 * Placeholder displayed when no products exist in the inventory
 * @param {Function} onAddNew - Handler to trigger product creation flow
 */
const EmptyState = ({ onAddNew }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
      <div className="text-6xl mb-4">🌾</div>
      <p className="text-lg font-semibold text-gray-900 mb-2">
        No Products Yet
      </p>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
        Start by adding your first product to showcase your farm's offerings.
      </p>
      <button
        onClick={onAddNew}
        className="px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition inline-flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Your First Product
      </button>
    </div>
  );
};

export default EmptyState;
