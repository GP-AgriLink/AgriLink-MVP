import { useState } from "react";
import productPlaceholder from "/product-placeholder.svg";

/**
 * ProductImage
 * Displays product image with fallback placeholder and loading states
 * @param {string} imageUrl - URL of the product image
 * @param {string} productName - Product name for alt text
 * @param {string} size - Image size variant (sm|md|lg|xl)
 * @param {string} className - Additional CSS classes
 */
const ProductImage = ({ imageUrl, productName, size = "md", className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const showPlaceholder = !imageUrl || imageError;

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center bg-emerald-50">
          <img
            src={productPlaceholder}
            alt={`${productName} placeholder`}
            className="h-1/2 w-1/2 text-emerald-600"
          />
        </div>
      ) : (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={productName}
            className="h-full w-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? "none" : "block" }}
          />
        </>
      )}
    </div>
  );
};

export default ProductImage;
