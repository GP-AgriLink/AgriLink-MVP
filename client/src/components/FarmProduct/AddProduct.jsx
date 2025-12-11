import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import LogoSpinner from "../common/LogoSpinner";
import { getAllCategories } from "../../services/farmProductApi";
import { X, Upload, Image as ImageIcon, CheckCircle, Sparkles } from "lucide-react";
import { sanitizeProductData, sanitizeString, sanitizeProductName } from "../../utils/sanitizers";
import { toast } from "react-toastify";
import {
  generateProductDescription,
  standardizeCategory,
  isAIConfigured,
} from "../../services/aiService";

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
  imageUrl: "",
  category: "",
  customCategory: "",
  description: "",
});

/**
 * AddProduct - Optimized with upload progress and performance enhancements
 * Features:
 * - Real-time upload progress tracking
 * - Memoized computations
 * - Optimized re-renders
 * - Visual upload feedback
 * - No image compression
 */
const AddProduct = memo(({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("url");
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiOperation, setAIOperation] = useState(""); // Track which AI operation is running

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
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
    } else {
      // Reset form when modal closes
      setFormData(getDefaultFormData());
      setErrors({});
      setImageFile(null);
      setImagePreview("");
      setImageInputMode("url");
      setShowCustomInput(false);
      setUploadProgress(0);
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    }
  }, [isOpen]);

  // Memoized handlers for better performance
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "category") {
        if (value === "Other") {
          setShowCustomInput(true);
        } else {
          setShowCustomInput(false);
          setFormData((prev) => ({ ...prev, customCategory: "" }));
        }
      }

      if (name === "imageUrl") {
        setImageFile(null);
        setImagePreview(value);
      }

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
      if (name === "category" && errors.customCategory) {
        setErrors((prev) => ({ ...prev, customCategory: "" }));
      }
    },
    [errors]
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
    }
  }, [formData.customCategory, allCategories]);

  const removeImage = useCallback(() => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
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
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (Max 5MB)");
      return;
    }

    // Validate file type
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
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setUploadProgress(0);
  }, []);

  // AI Handlers
  const handleGenerateDescription = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.warning("Please enter a product name first");
      return;
    }

    if (!isAIConfigured()) {
      toast.error("AI is not configured. Please add your Gemini API key to the .env file.");
      return;
    }

    setIsAIGenerating(true);
    setAIOperation("description");
    try {
      const description = await generateProductDescription(formData.name, formData.imageUrl);
      setFormData((prev) => ({ ...prev, description }));
      toast.success("Description generated!");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error(error.message || "Failed to generate description");
    } finally {
      setIsAIGenerating(false);
      setAIOperation("");
    }
  }, [formData.name, formData.imageUrl]);

  const handleStandardizeCategory = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.warning("Please enter a product name first");
      return;
    }

    if (!isAIConfigured()) {
      toast.error("AI is not configured. Please add your Gemini API key to the .env file.");
      return;
    }

    setIsAIGenerating(true);
    setAIOperation("category");
    try {
      const category = await standardizeCategory(formData.name, formData.imageUrl);

      // Check if it's one of the standard categories
      if (CATEGORY_OPTIONS.includes(category)) {
        setFormData((prev) => ({ ...prev, category, customCategory: "" }));
        setShowCustomInput(false);
      } else {
        // It's a custom category
        setFormData((prev) => ({ ...prev, category: "Other", customCategory: category }));
        setShowCustomInput(true);
      }

      toast.success(`Category set to: ${category}`);
    } catch (error) {
      console.error("AI Error:", error);
      toast.error(error.message || "Failed to standardize category");
    } finally {
      setIsAIGenerating(false);
      setAIOperation("");
    }
  }, [formData.name, formData.imageUrl]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const name = formData.name.trim();
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    // Strict product name validation: only letters, hyphens, spaces
    if (!name) {
      newErrors.name = "Product name is required";
    } else if (!/^[A-Za-z\u0621-\u064A\s\-]+$/.test(name)) {
      newErrors.name = "Product name can only contain letters, hyphens, and spaces";
    } else if ((name.match(/[a-zA-Z\u0621-\u064A]/g) || []).length < 3) {
      newErrors.name = "Product name must contain at least 3 letters";
    } else if (name.length < 2) {
      newErrors.name = "Must be at least 2 characters";
    } else if (name.length > 100) {
      newErrors.name = "Cannot exceed 100 characters";
    } else if (/\s{2,}/.test(name)) {
      newErrors.name = "Product name cannot have consecutive spaces";
    }

    if (!formData.price || isNaN(price) || price < 0.01)
      newErrors.price = "Price must be at least 0.01";
    else if (!/^\d+(\.\d{1,2})?$/.test(formData.price))
      newErrors.price = "Price can have at most 2 decimal places";

    if (!formData.unit) newErrors.unit = "Unit is required";

    if (formData.stock === "" || isNaN(stock) || stock < 1)
      newErrors.stock = "Stock must be at least 1";
    else if (stock !== parseInt(formData.stock, 10))
      newErrors.stock = "Stock must be a whole number";

    if (!formData.category) {
      newErrors.category = "Please select a category";
    } else if (formData.category === "Other" || showCustomInput) {
      if (!formData.customCategory.trim()) {
        newErrors.customCategory = "Please enter a custom category";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showCustomInput]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        // Determine the final category
        let finalCategory = formData.category;
        if (formData.category === "Other" || showCustomInput) {
          if (!formData.customCategory.trim()) {
            throw new Error("Please enter a custom category");
          }
          finalCategory = sanitizeString(formData.customCategory.trim());
        }

        const productData = {
          name: formData.name,
          price: formData.price,
          unit: formData.unit,
          stock: formData.stock,
          category: finalCategory,
          imageUrl: formData.imageUrl,
          description: formData.description, // Add description
          status: parseInt(formData.stock, 10) === 0 ? "inactive" : "active",
        };

        const sanitizedData = sanitizeProductData(productData);

        // Pass upload progress callback to parent
        await onSubmit(sanitizedData, imageFile, setUploadProgress, setIsUploading);

        onClose();
      } catch (error) {
        console.error("Error adding product:", error);
        setErrors({ submit: error.message || "Failed to add product" });
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [formData, showCustomInput, validateForm, onSubmit, onClose, imageFile]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting && !isUploading) {
      onClose();
    }
  }, [isSubmitting, isUploading, onClose]);

  // Memoize display image URL
  const displayImageUrl = useMemo(() => imagePreview, [imagePreview]);

  // Memoize file size display
  const fileSizeDisplay = useMemo(() => {
    if (!imageFile) return null;
    const sizeMB = (imageFile.size / (1024 * 1024)).toFixed(2);
    return `${sizeMB} MB`;
  }, [imageFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4">
      <div
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay with Progress */}
        {(isSubmitting || isUploading) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
            {isUploading && uploadProgress > 0 ? (
              <div className="flex flex-col items-center gap-4 px-6">
                <div className="relative h-32 w-32">
                  {/* Circular progress */}
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
              <LogoSpinner message="Creating Product..." />
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-2 text-white sm:px-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white bg-opacity-20 p-1.5 backdrop-blur-sm sm:p-2">
              <ImageIcon className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-bold sm:text-base">Add New Product</h2>
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
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Fresh Apples"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.name ? "shake border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>
                    Category <span className="text-red-500">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleStandardizeCategory}
                    disabled={isAIGenerating || !formData.name.trim()}
                    className="group flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs font-medium text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    title="AI Category Suggestion"
                  >
                    <Sparkles
                      className={`h-3.5 w-3.5 ${isAIGenerating && aiOperation === "category" ? "animate-spin" : "group-hover:animate-pulse"}`}
                    />
                    AI
                  </button>
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
                    list="category-suggestions"
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
                <datalist id="category-suggestions">
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

            {/* Price, Unit, and Stock in Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.stock && (
                  <p className="animate-fadeIn mt-1 text-xs text-red-500">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Description Field with AI */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-gray-700">
                <span>
                  Description <span className="text-xs text-gray-400">(Optional)</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isAIGenerating || !formData.name.trim()}
                  className="group flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs font-medium text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  title="AI Generate Description"
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 ${isAIGenerating && aiOperation === "description" ? "animate-spin" : "group-hover:animate-pulse"}`}
                  />
                  AI
                </button>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about this product..."
                rows="3"
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product Image <span className="text-xs text-gray-400">(Optional)</span>
              </label>

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

          {/* Action Buttons - Fixed at bottom */}
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
                disabled={isSubmitting || isUploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-emerald-600 hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                <ImageIcon className="h-4 w-4" />
                Add Product
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

AddProduct.displayName = "AddProduct";

export default AddProduct;
