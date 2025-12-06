import { useState, useRef, useEffect, memo } from "react";
import productPlaceholder from "/product-placeholder.svg";

/**
 * ProductImage - Enhanced with lazy loading and smooth animations
 * Displays product image with fallback placeholder, loading states, and lazy loading
 * @param {string} imageUrl - URL of the product image
 * @param {string} productName - Product name for alt text
 * @param {string} size - Image size variant (sm|md|lg|xl)
 * @param {string} className - Additional CSS classes
 * @param {boolean} lazy - Enable lazy loading (default: true)
 */
const ProductImage = memo(({ imageUrl, productName, size = "md", className = "", lazy = true }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" } // Start loading 50px before visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const showPlaceholder = !imageUrl || imageError;
  const shouldLoadImage = isInView && !showPlaceholder;

  return (
    <div
      ref={imgRef}
      className={`${sizeClasses[size]} group relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 transition-all duration-300 ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 transition-colors duration-300">
          <img
            src={productPlaceholder}
            alt={`${productName} placeholder`}
            className="h-1/2 w-1/2 object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
      ) : (
        <>
          {imageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Animated loader with modern design */}
              <div className="relative">
                <div className="border-3 h-8 w-8 animate-spin rounded-full border-emerald-500/30 border-t-emerald-500" />
                <div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full border-2 border-emerald-400/20" />
              </div>
            </div>
          )}
          {shouldLoadImage && (
            <img
              src={imageUrl}
              alt={productName}
              className={`h-full w-full object-cover transition-all duration-500 ${
                imageLoading
                  ? "scale-110 opacity-0 blur-sm"
                  : "scale-100 opacity-100 blur-0 group-hover:scale-105"
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          )}
        </>
      )}

      {/* Subtle overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
});

ProductImage.displayName = "ProductImage";

export default ProductImage;
