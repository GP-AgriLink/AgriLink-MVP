import { useState } from "react";
import productPlaceholder from "../../assets/product-placeholder.svg";

/**
 * ProductImage
 * Displays product image with fallback placeholder and loading states
 * @param {string} imageUrl - URL of the product image
 * @param {string} productName - Product name for alt text
 * @param {string} size - Image size variant (sm|md|lg|xl)
 * @param {string} className - Additional CSS classes
 */
const ProductImage = ({ 
  imageUrl, 
  productName, 
  size = "md",
  className = "" 
}) => {
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
      className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
    >
      {showPlaceholder ? (
        <div className="w-full h-full flex items-center justify-center bg-emerald-50">
          <img 
            src={productPlaceholder}
            alt={`${productName} placeholder`}
            className="w-1/2 h-1/2 text-emerald-600"
          />
        </div>
      ) : (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        </>
      )}
    </div>
  );
};

export default ProductImage;
