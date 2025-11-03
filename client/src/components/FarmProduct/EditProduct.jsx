import { useState, useEffect, useRef } from "react";
import { uploadProductImage } from "../../services/farmProductApi";
import { toast } from "react-toastify";

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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("url");
  const fileInputRef = useRef(null);

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
    }
  }, [product]);

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

    if (!name) newErrors.name = "Product name is required";
    else if (name.length < 2) newErrors.name = "Must be at least 2 characters";
    else if (name.length > 100) newErrors.name = "Cannot exceed 100 characters";

    if (!formData.price || isNaN(price) || price < 0.01) newErrors.price = "Price must be at least 0.01";
    else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) newErrors.price = "Price can have at most 2 decimal places";

    if (!formData.unit) newErrors.unit = "Please select a unit";

    if (formData.stock === "" || isNaN(stock) || stock < 0) newErrors.stock = "Stock must be 0 or greater";
    else if (stock !== parseFloat(formData.stock)) newErrors.stock = "Stock must be a whole number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.stock),
        status: formData.status,
        description: formData.description.trim() || "",
        imageUrl: formData.imageUrl.trim() || "",
      };

      await onSubmit(updateData);
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
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !product?._id) return;

    setIsUploading(true);
    toast.info("Uploading image...");

    try {
      const res = await uploadProductImage(product._id, file);
      setFormData(prev => ({ ...prev, imageUrl: res.imageUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading product image:", error);
      toast.error(error.message || "Image upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!isOpen || !product) return null;

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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Edit Product</h2>
              <p className="text-emerald-50 text-xs hidden sm:block">Update product details</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isSubmitting} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Product Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-4 sm:px-5 py-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-semibold text-xs sm:text-sm">Editing:</span>
            <span className="text-gray-900 font-bold text-xs sm:text-sm truncate flex-1">{product?.name}</span>
            {product?.stock === 0 && (
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0">Out of Stock</span>
            )}
          </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Fresh Brown Eggs" className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.name ? "border-red-500" : "border-gray-300"}`} />
              {errors.name && (<p className="text-red-500 text-xs mt-1">{errors.name}</p>)}
            </div>

            {/* Price, Unit, Stock, and Status in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.price ? "border-red-500" : "border-gray-300"}`} />
                </div>
                {errors.price && (<p className="text-red-500 text-xs mt-1">{errors.price}</p>)}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit <span className="text-red-500">*</span></label>
                <select name="unit" value={formData.unit} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.unit ? "border-red-500" : "border-gray-300"}`}>
                  <option value="">Select unit</option>
                  {UNIT_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
                {errors.unit && (<p className="text-red-500 text-xs mt-1">{errors.unit}</p>)}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock <span className="text-red-500">*</span></label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" min="0" className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.stock ? "border-red-500" : "border-gray-300"}`} />
                {errors.stock && (<p className="text-red-500 text-xs mt-1">{errors.stock}</p>)}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.status ? "border-red-500" : "border-gray-300"}`}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 text-xs">(Optional)</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell customers about your product..." rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm" />
            </div>

            {/* Image Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Image <span className="text-gray-400 text-xs">(Optional)</span>
              </label>

              {/* Mode Selector */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${imageInputMode === "url"
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Image URL
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${imageInputMode === "upload"
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
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
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  {formData.imageUrl && (
                    <div className="relative inline-block">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-emerald-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gradient-to-br from-gray-50 to-emerald-50/30 hover:border-emerald-400 transition"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {isUploading ? (
                        <>
                          <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          <span className="text-sm font-semibold text-gray-700">Click to upload image</span>
                          <span className="text-xs text-gray-500">PNG, JPG, WEBP (Max 5MB)</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button type="button" onClick={handleClose} disabled={isSubmitting} className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 text-sm">
                Cancel
              </button>
              <button type="submit" onClick={handleSubmit} disabled={isSubmitting || isUploading} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 text-sm">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
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

export default EditProduct;