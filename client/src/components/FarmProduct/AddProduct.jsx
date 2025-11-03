import { useState } from "react";

/**
 * Supported product units matching server model validation
 */
const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "piece", label: "Piece" },
  { value: "litre", label: "Litre (L)" },
  { value: "bundle", label: "Bundle" },
  { value: "unit", label: "Unit" },
];

/**
 * AddProduct
 * Modal form for creating new farm products
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Handler to close modal
 * @param {Function} onSubmit - Handler for form submission with product data
 */
const AddProduct = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "",
    stock: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    // Name validation
    if (!name) {
      newErrors.name = "Product name is required";
    } else if (name.length < 2) {
      newErrors.name = "Must be at least 2 characters";
    } else if (name.length > 100) {
      newErrors.name = "Cannot exceed 100 characters";
    }

    // Price validation
    if (!formData.price || isNaN(price) || price < 0.01) {
      newErrors.price = "Price must be at least 0.01";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = "Price can have at most 2 decimal places";
    }

    // Unit validation
    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    } else if (!UNIT_OPTIONS.find(o => o.value === formData.unit)) {
      newErrors.unit = "Invalid unit selected";
    }

    // Stock validation
    if (formData.stock === "" || isNaN(stock) || stock < 0) {
      newErrors.stock = "Stock must be 0 or greater";
    } else if (stock !== parseFloat(formData.stock)) {
      newErrors.stock = "Stock must be a whole number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Server requires: name, price, unit, stock (only these 4 fields are required)
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.stock),
      };

      await onSubmit(productData);

      // Reset form and close modal
      setFormData({
        name: "",
        price: "",
        unit: "",
        stock: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      setErrors({ submit: error.message || "Failed to add product" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        price: "",
        unit: "",
        stock: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-2 sm:p-4 backdrop-blur-sm"
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white px-4 sm:px-5 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Add New Product</h2>
              <p className="text-emerald-50 text-xs hidden sm:block">Name, Price, Unit, Stock</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 space-y-3">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Fresh Brown Eggs"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.name ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Price, Unit, and Stock in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.unit ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  <option value="">Select unit</option>
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Adding...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;