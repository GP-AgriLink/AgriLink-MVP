import { Plus } from "lucide-react";

/**
 * ProductListHeader
 * Displays the main header and 'Add New Product' button
 * @param {Function} onAddNew - Handler to create new product
 */
const ProductListHeader = ({ onAddNew }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">My Products</h2>
      <button
        onClick={onAddNew}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700 sm:justify-start"
      >
        <Plus className="h-5 w-5" />
        Add New Product
      </button>
    </div>
  );
};

export default ProductListHeader;
