import { useState, useEffect, useRef } from "react";
import { uploadProductImage } from "../../services/farmProductApi";
import { toast } from "react-toastify";
import LogoSpinner from "../common/LogoSpinner";

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
 * EditProduct
 * Modal form for editing existing farm products
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Handler to close modal
 * @param {Function} onSubmit - Handler for form submission with updated data
 * @param {Object} product - Product object to edit
 */
const EditProduct = ({ isOpen, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "",
    stock: "",
    description: "",
    imageUrl: "",
    status: "active",
  });

  // New state to hold the selected file object
  const [imageFile, setImageFile] = useState(null);
  // State to hold the local preview URL
  const [imagePreview, setImagePreview] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // This now just means "submitting"
  const [imageInputMode, setImageInputMode] = useState("url");
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef(null); // To manage revoking the object URL

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        unit: product.unit || "",
        stock: product.stock?.toString() || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        status: product.status || "active",
      });
      // Set the initial preview to the product's existing URL
      setImagePreview(product.imageUrl || "");
    }

    // Clear file state when modal opens or product changes
    setImageFile(null);
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If user edits the URL, clear any staged file upload
    if (name === "imageUrl") {
      setImageFile(null);
      setImagePreview(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (!name) newErrors.name = "Product name is required";
    else if (name.length < 2) newErrors.name = "Must be at least 2 characters";
    else if (name.length > 100) newErrors.name = "Cannot exceed 100 characters";

    if (!formData.price || isNaN(price) || price < 0.01)
      newErrors.price = "Price must be at least 0.01";
    else if (!/^\d+(\.\d{1,2})?$/.test(formData.price))
      newErrors.price = "Price can have at most 2 decimal places";

    if (!formData.unit) newErrors.unit = "Please select a unit";

    if (formData.stock === "" || isNaN(stock) || stock < 0)
      newErrors.stock = "Stock must be 0 or greater";
    else if (stock !== parseFloat(formData.stock)) newErrors.stock = "Stock must be a whole number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const stock = parseInt(formData.stock, 10);
      const status = stock === 0 ? "inactive" : formData.status;

      const updateData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: stock,
        status: status,
        description: formData.description.trim() || "",
        // If a new file wasn't staged, send the current imageUrl (which might be an old URL or a new pasted URL)
        // If a file *was* staged, the parent (Dashboard) will handle it, so we can send the original URL.
        imageUrl: imageFile ? product.imageUrl : formData.imageUrl.trim() || "",
      };

      // Pass both the data and the file (if it exists) to the parent
      await onSubmit(updateData, imageFile);

      setErrors({});
      onClose(); // Parent will close modal on success
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
      onClose(); // This will trigger the useEffect to clean up state
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file (optional, but good practice)
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

    // Set the file to state and update the preview
    setImageFile(file);
    setImagePreview(localPreviewUrl);

    // Clear the URL field to avoid confusion
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
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
          {/* ... (header content unchanged) ... */}
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
            <div>
              <h2 className="text-base font-bold sm:text-lg">Edit Product</h2>
              <p className="hidden text-xs text-emerald-50 sm:block">Update product details</p>
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

        {/* ... (Current Product Banner unchanged) ... */}
        <div className="flex-shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 sm:text-sm">Editing:</span>
            <span className="flex-1 truncate text-xs font-bold text-gray-900 sm:text-sm">
              {product?.name}
            </span>
            {product?.stock === 0 && (
              <span className="flex-shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4 sm:p-5">
            {/* ... (Validation errors, Name, Price, Unit, Stock, Status, Description unchanged) ... */}

            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors.submit}
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Fresh Brown Eggs"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
                    className={`w-full rounded-lg border py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.unit ? "border-red-500" : "border-gray-300"}`}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.stock ? "border-red-500" : "border-gray-300"}`}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.status ? "border-red-500" : "border-gray-300"} ${parseInt(formData.stock, 10) === 0 ? "bg-gray-100 text-gray-500" : ""}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Description */}
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
                  {displayImageUrl &&
                    !imageFile && ( // Only show preview if it's not a local file preview
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
                  {/* Local Preview for Uploaded File */}
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
                disabled={isSubmitting || isUploading}
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
