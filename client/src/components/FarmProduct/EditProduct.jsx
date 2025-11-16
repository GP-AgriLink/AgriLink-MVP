import { useState, useEffect, useRef, useMemo } from "react";
import { getAllCategories } from "../../services/farmProductApi";
import { toast } from "react-toastify";
import LogoSpinner from "../common/LogoSpinner";
import { sanitizeProductData, sanitizeString } from "../../utils/sanitizers";

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

const CATEGORY_OPTIONS = ["Vegetables", "Fruits", "Grains"];

const getDefaultFormData = () => ({
  name: "",
  price: "",
  unit: "",
  stock: "",
  description: "",
  imageUrl: "",
  status: "active",
  category: "",
  customCategory: "",
});

const EditProduct = ({ isOpen, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [originalProduct, setOriginalProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("url");
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef(null);
  const [allCategories, setAllCategories] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      const loadedCategory = (product.categories && product.categories[0]) || "";
      let initialCategory = "";
      let initialCustomCategory = "";

      if (CATEGORY_OPTIONS.includes(loadedCategory)) {
        initialCategory = loadedCategory;
      } else if (loadedCategory) {
        initialCategory = "Other";
        initialCustomCategory = loadedCategory;
      }

      const initialData = {
        name: product.name || "",
        price: product.price?.toString() || "",
        unit: product.unit || "",
        stock: product.stock?.toString() || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        status: product.status || "active",
        category: initialCategory,
        customCategory: initialCustomCategory,
      };
      setFormData(initialData);
      setOriginalProduct(initialData);
      setImagePreview(product.imageUrl || "");
      setErrors({});
      setIsValid(true);
      setShowCustomInput(false);

      const fetchCategories = async () => {
        try {
          const cats = await getAllCategories();
          const customCats = cats.filter((c) => !CATEGORY_OPTIONS.includes(c) && c !== "Other");
          setAllCategories(customCats);
        } catch (error) {
          console.error("Failed to fetch categories", error);
        }
      };
      fetchCategories();
    }

    setImageFile(null);
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
  }, [product, isOpen]);

  const sanitizedFormData = useMemo(() => {
    return {
      ...sanitizeProductData(formData),
      category: formData.category,
      customCategory: sanitizeString(formData.customCategory),
    };
  }, [formData]);

  const sanitizedOriginalProduct = useMemo(() => {
    if (!originalProduct) return null;
    return {
      ...sanitizeProductData(originalProduct),
      category: originalProduct.category,
      customCategory: sanitizeString(originalProduct.customCategory),
    };
  }, [originalProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    if (name === "category") {
      if (value === "Other") {
        setShowCustomInput(true);
      } else {
        setShowCustomInput(false);
        newFormData.customCategory = "";
      }
    }

    setFormData(newFormData);

    if (name === "imageUrl") {
      setImageFile(null);
      setImagePreview(value);
    }

    validateForm(newFormData);
  };

  const handleCustomCategoryBlur = () => {
    const customCat = formData.customCategory.trim();
    if (customCat) {
      // Add to allCategories if not already present
      if (!allCategories.includes(customCat)) {
        setAllCategories((prev) => [...prev, customCat]);
      }
      // Set the custom category as the selected category and hide input
      setFormData((prev) => ({
        ...prev,
        category: customCat,
        customCategory: customCat,
      }));
      setShowCustomInput(false);
      validateForm({
        ...formData,
        category: customCat,
        customCategory: customCat,
      });
    }
  };

  const validateForm = (dataToValidate = formData) => {
    const newErrors = {};
    const name = dataToValidate.name.trim();
    const price = parseFloat(dataToValidate.price);
    const stock = parseInt(dataToValidate.stock);

    if (!name) newErrors.name = "Product name is required";
    else if (name.length < 2) newErrors.name = "Must be at least 2 characters";
    else if (name.length > 100) newErrors.name = "Cannot exceed 100 characters";

    if (!dataToValidate.price || isNaN(price) || price < 0.01)
      newErrors.price = "Price must be at least 0.01";
    else if (!/^\d+(\.\d{1,2})?$/.test(dataToValidate.price))
      newErrors.price = "Price can have at most 2 decimal places";

    if (!dataToValidate.unit) newErrors.unit = "Please select a unit";

    if (dataToValidate.stock === "" || isNaN(stock) || stock < 0)
      newErrors.stock = "Stock must be 0 or greater";
    else if (stock !== parseFloat(dataToValidate.stock))
      newErrors.stock = "Stock must be a whole number";

    if (!dataToValidate.category) {
      newErrors.category = "Please select a category";
    } else if (dataToValidate.category === "Other" || showCustomInput) {
      if (!dataToValidate.customCategory.trim()) {
        newErrors.customCategory = "Please enter a custom category";
      }
    }

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };

  const isDirty = useMemo(() => {
    if (!sanitizedOriginalProduct) return false;
    if (imageFile) return true;

    // Get final categories for comparison
    const currentFinalCategory =
      sanitizedFormData.category === "Other" || showCustomInput
        ? sanitizedFormData.customCategory
        : sanitizedFormData.category;
    const originalFinalCategory =
      sanitizedOriginalProduct.category === "Other"
        ? sanitizedOriginalProduct.customCategory
        : sanitizedOriginalProduct.category;

    if (sanitizedFormData.name !== sanitizedOriginalProduct.name) return true;
    if (sanitizedFormData.price !== sanitizedOriginalProduct.price) return true;
    if (sanitizedFormData.unit !== sanitizedOriginalProduct.unit) return true;
    if (sanitizedFormData.stock !== sanitizedOriginalProduct.stock) return true;
    if (sanitizedFormData.description !== sanitizedOriginalProduct.description) return true;
    if (sanitizedFormData.imageUrl !== sanitizedOriginalProduct.imageUrl) return true;
    if (sanitizedFormData.status !== sanitizedOriginalProduct.status) return true;
    if (currentFinalCategory !== originalFinalCategory) return true;

    return false;
  }, [sanitizedFormData, sanitizedOriginalProduct, imageFile, showCustomInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !isDirty) return;

    setIsSubmitting(true);
    try {
      const changedData = {};

      // Only include changed fields
      if (sanitizedFormData.name !== sanitizedOriginalProduct.name) {
        changedData.name = sanitizedFormData.name;
      }
      if (sanitizedFormData.price !== sanitizedOriginalProduct.price) {
        changedData.price = sanitizedFormData.price;
      }
      if (sanitizedFormData.unit !== sanitizedOriginalProduct.unit) {
        changedData.unit = sanitizedFormData.unit;
      }
      if (sanitizedFormData.stock !== sanitizedOriginalProduct.stock) {
        changedData.stock = sanitizedFormData.stock;
      }
      if (sanitizedFormData.description !== sanitizedOriginalProduct.description) {
        changedData.description = sanitizedFormData.description;
      }
      if (!imageFile && sanitizedFormData.imageUrl !== sanitizedOriginalProduct.imageUrl) {
        changedData.imageUrl = sanitizedFormData.imageUrl;
      }

      // Get final category values
      const currentFinalCategory =
        sanitizedFormData.category === "Other" || showCustomInput
          ? sanitizeString(sanitizedFormData.customCategory.trim())
          : sanitizedFormData.category;
      const originalFinalCategory =
        sanitizedOriginalProduct.category === "Other"
          ? sanitizeString(sanitizedOriginalProduct.customCategory.trim())
          : sanitizedOriginalProduct.category;

      // Only include category if it changed
      if (currentFinalCategory !== originalFinalCategory) {
        changedData.categories = [currentFinalCategory];
      }

      // Calculate new status based on stock
      const newStatus =
        parseInt(sanitizedFormData.stock, 10) === 0 ? "inactive" : sanitizedFormData.status;
      if (newStatus !== sanitizedOriginalProduct.status) {
        changedData.status = newStatus;
      }

      // Don't send request if no changes (safety check)
      if (Object.keys(changedData).length === 0 && !imageFile) {
        onClose();
        return;
      }

      await onSubmit(changedData, imageFile);

      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      setErrors({ submit: error.message || "Failed to update product" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  const removeImage = () => {
    const newFormData = { ...formData, imageUrl: "" };
    setFormData(newFormData);
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    validateForm(newFormData);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (Max 5MB)");
      return;
    }

    // Revoke old local preview URL if one exists
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }

    // Create a local preview URL
    const localPreviewUrl = URL.createObjectURL(file);
    localPreviewRef.current = localPreviewUrl;

    setImageFile(file);
    setImagePreview(localPreviewUrl);

    const newFormData = { ...formData, imageUrl: "" };
    setFormData(newFormData);
    validateForm(newFormData);
  };

  if (!isOpen || !product) return null;

  const displayImageUrl = imagePreview;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4">
      <div
        className="relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {isSubmitting && <LogoSpinner message="Updating Product..." />}
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-3 text-white sm:px-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white bg-opacity-20 p-1.5 backdrop-blur-sm sm:p-2">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1 text-base font-bold sm:text-lg">
              <span className="font-semibold text-white sm:text-base">Editing:</span>
              <span className="flex-1 truncate text-xs font-bold text-white sm:text-base">
                {product?.name}
              </span>
              {product?.stock === 0 && (
                <span className="flex-shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-white transition-all duration-200 hover:bg-white hover:bg-opacity-20 sm:p-2"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4 sm:p-5">
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors.submit}
              </div>
            )}
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
              {/* Product Name */}
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Fresh Brown Eggs"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                {showCustomInput ? (
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    onBlur={handleCustomCategoryBlur}
                    placeholder="e.g., Sweets, Dairy, etc."
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.category || errors.customCategory
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    list="category-suggestions-edit"
                    autoFocus
                  />
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {/* {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))} */}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                )}
                <datalist id="category-suggestions-edit">
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {(errors.category || errors.customCategory) && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.category || errors.customCategory}
                  </p>
                )}
              </div>
            </div>
            {/* Price, Unit, Stock, and Status in Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Price */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full rounded-lg border py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>

              {/* Unit */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.unit ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select unit</option>
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
              </div>

              {/* Stock */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={parseInt(formData.stock, 10) === 0}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  } ${parseInt(formData.stock, 10) === 0 ? "bg-gray-100 text-gray-500" : ""}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Description <span className="text-xs text-gray-400">(Optional)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your product..."
                rows="2"
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Image Section */}
            <div>
              {/* ... (Mode Selector unchanged) ... */}
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product Image <span className="text-xs text-gray-400">(Optional)</span>
              </label>

              {/* Mode Selector */}
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode("url");
                    setImageFile(null); // Clear file if switching to URL
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    imageInputMode === "url"
                      ? "border-2 border-emerald-500 bg-emerald-100 text-emerald-700"
                      : "border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Image URL
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    imageInputMode === "upload"
                      ? "border-2 border-emerald-500 bg-emerald-100 text-emerald-700"
                      : "border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload
                  </div>
                </button>
              </div>

              {/* Image URL Input */}
              {imageInputMode === "url" && (
                <div className="space-y-2">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl} // Controlled by formData
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {displayImageUrl && !imageFile && (
                    <div className="relative inline-block">
                      <img
                        src={displayImageUrl}
                        alt="Preview"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                        className="h-24 w-24 rounded-lg border-2 border-emerald-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                      >
                        <svg
                          className="h-3 w-3"
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
                  )}
                </div>
              )}

              {/* Upload Section */}
              {imageInputMode === "upload" && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()} // Trigger hidden input
                    disabled={isUploading}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-emerald-50/30 p-4 text-center transition hover:border-emerald-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {isUploading ? (
                        <>
                          <svg
                            className="h-8 w-8 animate-spin text-emerald-600"
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
                          <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">
                            Click to upload image
                          </span>
                          <span className="text-xs text-gray-500">PNG, JPG, WEBP (Max 5MB)</span>
                        </>
                      )}
                    </div>
                  </button>
                  {imageFile && displayImageUrl && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={displayImageUrl}
                        alt="Preview"
                        className="h-24 w-24 rounded-lg border-2 border-emerald-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                      >
                        <svg
                          className="h-3 w-3"
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
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 border-t bg-gray-50 px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading || !isDirty || !isValid}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
