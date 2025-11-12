import noProductImage from "/no-products.svg";

/**
 * EmptyState
 * Placeholder displayed when no products exist
 * @param {Function} onAddNew - Handler to trigger product creation flow
 * @param {string} title - The main message to display
 * @param {string} message - The sub-message
 */
const EmptyState = ({
  onAddNew,
  title = "No Products Yet",
  message = "Start by adding your first product to showcase your farm's offerings.",
}) => {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
      <img src={noProductImage} alt="No products found" className="mb-4 h-64 w-64" />
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-500">{message}</p>
      {onAddNew && (
        <button
          onClick={onAddNew}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Your First Product
        </button>
      )}
    </div>
  );
};

export default EmptyState;
