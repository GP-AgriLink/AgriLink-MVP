import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { getAllCategories } from "../../services/farmProductApi";
import { toast } from "react-toastify";
import LogoSpinner from "../common/LogoSpinner";
import { sanitizeProductData, sanitizeString } from "../../utils/sanitizers";
import { X, Upload, Image as ImageIcon, Edit2, CheckCircle } from "lucide-react";

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

/**
 * EditProduct - Enhanced with upload progress and performance optimizations
 * Matches AddProduct UI/UX improvements
 */
const EditProduct = memo(({ isOpen, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [originalProduct, setOriginalProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("url");
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef(null);
  const [allCategories, setAllCategories] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Helper function to get the final category value
  const getFinalCategory = useCallback((category, customCategory) => {
    if (category === "Other" || !CATEGORY_OPTIONS.includes(category)) {
      return sanitizeString(customCategory.trim());
    }
    return category;
  }, []);

  useEffect(() => {
    if (product && isOpen) {
      const loadedCategory = product.category || "";
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
      setShowCustomInput(initialCategory === "Other");
      setUploadProgress(0);

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

  const handleChange = useCallback(
    (e) => {
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
    },
    [formData]
  );

  const handleCustomCategoryBlur = useCallback(() => {
    const customCat = formData.customCategory.trim();
    if (customCat) {
      if (!allCategories.includes(customCat)) {
        setAllCategories((prev) => [...prev, customCat]);
      }
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
  }, [formData, allCategories]);

  const validateForm = useCallback(
    (dataToValidate = formData) => {
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
    },
    [formData, showCustomInput]
  );

  const isDirty = useMemo(() => {
    if (!sanitizedOriginalProduct) return false;
    if (imageFile) return true;

    const currentFinalCategory = getFinalCategory(
      sanitizedFormData.category,
      sanitizedFormData.customCategory
    );
    const originalFinalCategory = getFinalCategory(
      sanitizedOriginalProduct.category,
      sanitizedOriginalProduct.customCategory
    );

    if (sanitizedFormData.name !== sanitizedOriginalProduct.name) return true;
    if (sanitizedFormData.price !== sanitizedOriginalProduct.price) return true;
    if (sanitizedFormData.unit !== sanitizedOriginalProduct.unit) return true;
    if (sanitizedFormData.stock !== sanitizedOriginalProduct.stock) return true;
    if (sanitizedFormData.description !== sanitizedOriginalProduct.description) return true;
    if (sanitizedFormData.imageUrl !== sanitizedOriginalProduct.imageUrl) return true;
    if (sanitizedFormData.status !== sanitizedOriginalProduct.status) return true;
    if (currentFinalCategory !== originalFinalCategory) return true;

    return false;
  }, [sanitizedFormData, sanitizedOriginalProduct, imageFile, getFinalCategory]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isValid || !isDirty) return;

      setIsSubmitting(true);
      try {
        const changedData = {};

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

        const currentFinalCategory = getFinalCategory(
          sanitizedFormData.category,
          sanitizedFormData.customCategory
        );
        const originalFinalCategory = getFinalCategory(
          sanitizedOriginalProduct.category,
          sanitizedOriginalProduct.customCategory
        );

        if (currentFinalCategory !== originalFinalCategory) {
          changedData.category = currentFinalCategory;
        }

        const newStatus =
          parseInt(sanitizedFormData.stock, 10) === 0 ? "inactive" : sanitizedFormData.status;
        if (newStatus !== sanitizedOriginalProduct.status) {
          changedData.status = newStatus;
        }

        if (Object.keys(changedData).length === 0 && !imageFile) {
          onClose();
          return;
        }

        // Pass progress callbacks to parent
        await onSubmit(changedData, imageFile, setUploadProgress, setIsUploading);

        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error updating product:", error);
        setErrors({ submit: error.message || "Failed to update product" });
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [
      isValid,
      isDirty,
      sanitizedFormData,
      sanitizedOriginalProduct,
      showCustomInput,
      imageFile,
      getFinalCategory,
      onSubmit,
      onClose,
    ]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting && !isUploading) {
      setErrors({});
      onClose();
    }
  }, [isSubmitting, isUploading, onClose]);

  const removeImage = useCallback(() => {
    const newFormData = { ...formData, imageUrl: "" };
    setFormData(newFormData);
    setImagePreview("");
    setImageFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    validateForm(newFormData);
  }, [formData, validateForm]);

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large (Max 5MB)");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }

      const localPreviewUrl = URL.createObjectURL(file);
      localPreviewRef.current = localPreviewUrl;

      setImageFile(file);
      setImagePreview(localPreviewUrl);
      setUploadProgress(0);

      const newFormData = { ...formData, imageUrl: "" };
      setFormData(newFormData);
      validateForm(newFormData);
    },
    [formData, validateForm]
  );

  // Memoized values
  const displayImageUrl = useMemo(() => imagePreview, [imagePreview]);

  const fileSizeDisplay = useMemo(() => {
    if (!imageFile) return null;
    const sizeMB = (imageFile.size / (1024 * 1024)).toFixed(2);
    return `${sizeMB} MB`;
  }, [imageFile]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4">
      <div
        className="relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay with Progress */}
        {(isSubmitting || isUploading) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
            {isUploading && uploadProgress > 0 ? (
              <div className="flex flex-col items-center gap-4 px-6">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - uploadProgress / 100)}`}
                      className="text-emerald-600 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {uploadProgress === 100 ? (
                      <CheckCircle className="h-12 w-12 animate-bounce text-emerald-600" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 animate-pulse text-emerald-600" />
                        <span className="mt-1 text-2xl font-bold text-emerald-600">
                          {uploadProgress}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    {uploadProgress === 100 ? "Processing..." : "Uploading Image..."}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {uploadProgress === 100 ? "Almost done!" : `${uploadProgress}% complete`}
                  </p>
                </div>
              </div>
            ) : (
              <LogoSpinner message="Updating Product..." />
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-3 text-white sm:px-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white bg-opacity-20 p-1.5 backdrop-blur-sm sm:p-2">
              <Edit2 className="h-5 w-5" strokeWidth={2.5} />
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
            disabled={isSubmitting || isUploading}
            className="rounded-full p-1.5 text-white transition-all duration-200 hover:bg-white hover:bg-opacity-20 disabled:opacity-50 sm:p-2"
            type="button"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4 sm:p-5">
            {errors.submit && (
              <div className="animate-shake rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.name ? "shake border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">{errors.name}</p>
                )}
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other (Please specify)</option>
                  </select>
                )}
                <datalist id="category-suggestions-edit">
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {(errors.category || errors.customCategory) && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">
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
                    className={`w-full rounded-lg border py-2 pl-8 pr-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">{errors.price}</p>
                )}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                {errors.unit && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">{errors.unit}</p>
                )}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.stock && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">{errors.stock}</p>
                )}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Image Section */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product Image <span className="text-xs text-gray-400">(Optional)</span>
              </label>

              {/* Mode Selector */}
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode("url");
                    setImageFile(null);
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    imageInputMode === "url"
                      ? "border-2 border-emerald-500 bg-emerald-100 text-emerald-700"
                      : "border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <ImageIcon className="h-4 w-4" />
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
                    <Upload className="h-4 w-4" />
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {displayImageUrl && !imageFile && (
                    <div className="group relative inline-block">
                      <img
                        src={displayImageUrl}
                        alt="Preview"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                        className="h-24 w-24 rounded-lg border-2 border-emerald-200 object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
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

                  {imageFile && displayImageUrl ? (
                    <div className="space-y-2">
                      <div className="group relative inline-block">
                        <img
                          src={displayImageUrl}
                          alt="Preview"
                          className="h-32 w-32 rounded-lg border-2 border-emerald-200 object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p className="font-medium">{imageFile.name}</p>
                        <p className="text-gray-400">Size: {fileSizeDisplay}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="group w-full rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6 text-center transition-all hover:border-emerald-400 hover:shadow-md disabled:opacity-50"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-emerald-100 p-4 transition-transform group-hover:scale-110">
                          <Upload className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Click to upload image
                          </p>
                          <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP (Max 5MB)</p>
                          <p className="mt-1 text-xs font-medium text-emerald-600">
                            Original quality preserved
                          </p>
                        </div>
                      </div>
                    </button>
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
                disabled={isSubmitting || isUploading}
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !isDirty || !isValid}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-emerald-600 hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                <Edit2 className="h-4 w-4" />
                Update Product
              </button>
            </div>
          </div>
        </form>

        {/* Animations */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-in;
          }
          
          .shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
});

EditProduct.displayName = "EditProduct";

export default EditProduct;
