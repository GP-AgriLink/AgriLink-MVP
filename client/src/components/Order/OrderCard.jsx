import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { reverseGeocodeSmart } from "../../utils/geoCode";

// Memoized OrderItem component for better performance
const OrderItem = memo(({ item, formatNumber }) => (
  <div className="flex justify-between border-b border-gray-100 py-1 text-sm text-gray-600 last:border-none">
    <div className="flex flex-col text-left">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-gray-500">
        {item.qty} pcs × ${formatNumber(item.price)}
      </span>
    </div>
    <span className="font-semibold text-gray-700">
      ${formatNumber(item.qty * item.price)}
    </span>
  </div>
));

OrderItem.displayName = 'OrderItem';

// Skeleton loader component
const OrderCardSkeleton = memo(() => (
  <div className="w-full max-w-[420px] 3xl:max-w-[520px] bg-white border border-green-100 rounded-2xl p-5 sm:p-6 shadow-lg animate-pulse">
    <div className="mb-3 flex justify-between">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-6 w-20 bg-gray-200 rounded" />
    </div>
    <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
    <div className="flex items-center gap-2 mb-1">
      <div className="h-8 w-8 bg-gray-200 rounded-full" />
      <div className="h-5 w-40 bg-gray-200 rounded" />
    </div>
    <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
    <div className="h-16 bg-gray-100 rounded-xl mb-4" />
  </div>
));

OrderCardSkeleton.displayName = 'OrderCardSkeleton';

const OrderCard = memo(({ order, onOrderUpdate, userRole }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const cardRef = useCallback((node) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const orderData = order;
  const isFarmer = userRole === "farmer";
  const isCustomer = userRole === "customer";

  // Determine the initial status
  const initialStatus =
    orderData.status === "Ready for Delivery" ? "Delivery" : orderData.status;
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (orderData.status === "Ready for Delivery") setStatus("Delivery");
    else setStatus(orderData.status);
  }, [orderData.status]);

  // Lazy load farm location only when user expands location section
  useEffect(() => {
    if (!isCustomer || !orderData.farmLocation || !isLocationExpanded || locationName) {
      return;
    }

    let mounted = true;
    let timeoutId;
    
    const resolveLocation = async () => {
      setIsResolvingLocation(true);
      
      // Set a timeout fallback
      timeoutId = setTimeout(() => {
        if (mounted && !locationName) {
          const [lon, lat] = orderData.farmLocation;
          setLocationName(`${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
          setIsResolvingLocation(false);
        }
      }, 5000);
      
      try {
        const name = await reverseGeocodeSmart(orderData.farmLocation);
        if (mounted) {
          clearTimeout(timeoutId);
          if (name) {
            setLocationName(name);
          } else {
            const [lon, lat] = orderData.farmLocation;
            setLocationName(`${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
          }
        }
      } catch (error) {
        console.error("Failed to resolve location:", error);
        if (mounted) {
          clearTimeout(timeoutId);
          const [lon, lat] = orderData.farmLocation;
          setLocationName(`${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
        }
      } finally {
        if (mounted) {
          setIsResolvingLocation(false);
        }
      }
    };

    resolveLocation();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderData.farmLocation, isCustomer, isLocationExpanded, locationName]);

  const formatNumber = useCallback((num) =>
    typeof num === "number" && !isNaN(num) ? num.toFixed(2) : "0.00",
  []);

  // Validate order status transitions
  const validateTransition = useCallback((currentStatus, newStatus) => {
    const actualCurrent = currentStatus === "Delivery" ? "Ready for Delivery" : currentStatus;
    const actualNew = newStatus === "Delivery" ? "Ready for Delivery" : newStatus;

    // Cannot change if already completed or cancelled
    if (actualCurrent === "Completed" || actualCurrent === "Cancelled") {
      return { valid: false, message: `Order is already ${actualCurrent} and cannot be changed.` };
    }

    // From "Incoming": can only go to "Ready for Delivery" or "Cancelled"
    if (actualCurrent === "Incoming") {
      if (actualNew !== "Ready for Delivery" && actualNew !== "Cancelled") {
        return { valid: false, message: 'Incoming orders can only be set to "Ready for Delivery" or "Cancelled".' };
      }
    }

    // From "Ready for Delivery": can only go to "Completed" or "Cancelled"
    if (actualCurrent === "Ready for Delivery") {
      if (actualNew !== "Completed" && actualNew !== "Cancelled") {
        return { valid: false, message: 'Orders ready for delivery can only be set to "Completed" or "Cancelled".' };
      }
    }

    return { valid: true };
  }, []);

  const handleClick = useCallback(async (newStatus) => {
    if (newStatus === status) return;

    const validation = validateTransition(status, newStatus);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const actualStatus = newStatus === "Delivery" ? "Ready for Delivery" : newStatus;
    
    setStatus(newStatus === "Delivery" ? "Delivery" : newStatus);
    setFadeOut(true);
    
    setTimeout(async () => {
      try {
        await onOrderUpdate(orderData.id, actualStatus);
      } catch (err) {
        console.error("Failed to update order:", err);
        alert("Failed to update order status. Please try again.");
        setFadeOut(false);
        setStatus(status); // Revert to previous status
      }
    }, 300);
  }, [orderData.id, onOrderUpdate, status, validateTransition]);

  const toggleItems = useCallback(() => {
    setIsItemsExpanded(prev => !prev);
  }, []);

  const toggleLocation = useCallback(() => {
    setIsLocationExpanded(prev => !prev);
  }, []);

  const cardStyle = useMemo(() => 
    status === "Delivery" ? "bg-gray-50 border-gray-200" : "bg-white border-green-100",
  [status]);

  // Memoize expensive computations
  const items = useMemo(() => orderData.items || [], [orderData.items]);
  const displayName = useMemo(
    () => orderData.displayName || (isFarmer ? "Unknown Customer" : "Unknown Farm"),
    [orderData.displayName, isFarmer]
  );
  const contactInfo = useMemo(() => orderData.contactInfo || "N/A", [orderData.contactInfo]);
  const total = useMemo(() => orderData.total || 0, [orderData.total]);
  const date = useMemo(() => orderData.date, [orderData.date]);
  const avatarUrl = useMemo(() => orderData.avatarUrl, [orderData.avatarUrl]);
  const hasLocation = useMemo(
    () => isCustomer && orderData.farmLocation,
    [isCustomer, orderData.farmLocation]
  );

  // Show skeleton if card hasn't been viewed yet and it's for lazy loading
  if (!isVisible) {
    return <div ref={cardRef}><OrderCardSkeleton /></div>;
  }

  return (
    <div
      className={`w-full max-w-[420px] 3xl:max-w-[520px] ${cardStyle} flex flex-col justify-between rounded-2xl border p-5 shadow-lg transition-all duration-300 sm:p-6 ${fadeOut ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        }`}
    >
      <div>
        {/* Order Info */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-gray-500">
            {date
              ? new Date(date).toLocaleDateString("en-GB", { dateStyle: "medium" })
              : "Unknown Date"}
          </p>
          <span className="self-start rounded-md bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 sm:self-auto">
            Total ${formatNumber(total)}
          </span>
        </div>

        <h3
          className={`mb-1 text-left text-lg font-semibold ${status === "Delivery" ? "text-green-700" : "text-gray-800"
            }`}
        >
          {status === "Incoming"
            ? "Incoming Order"
            : status === "Delivery"
              ? "Delivery Order"
              : status}
        </h3>

        {/* Display Name with Avatar for Customers */}
        <div className="mb-1 flex items-center gap-2">
          {isCustomer && isVisible && (
            <div className="relative h-8 w-8 flex-shrink-0">
              {avatarUrl && !avatarError ? (
                <>
                  {!avatarLoaded && (
                    <div className="h-full w-full animate-pulse rounded-full bg-gray-200" />
                  )}
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className={`h-full w-full rounded-full object-cover shadow-sm ring-2 ring-emerald-100 transition-opacity duration-300 ${
                      avatarLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setAvatarLoaded(true)}
                    onError={() => {
                      setAvatarError(true);
                      setAvatarLoaded(true);
                    }}
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-xs font-semibold text-emerald-700 shadow-sm ring-2 ring-emerald-100">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          <p className="font-medium text-gray-700">{displayName}</p>
        </div>

        {/* Contact Info for Farmers */}
        {isFarmer && (
          <p className="mb-4 text-sm text-gray-500">{contactInfo}</p>
        )}

        {/* Location Section for Customers */}
        {isCustomer && (
          <div className="mb-4">
            {hasLocation ? (
              <div className="flex items-center gap-2">
                {!isLocationExpanded ? (
                  <button
                    onClick={toggleLocation}
                    className="group inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60 transition-all hover:from-emerald-100 hover:to-teal-100 hover:ring-emerald-300 hover:shadow-sm active:scale-95"
                  >
                    <MapPin className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    <span>View Location</span>
                  </button>
                ) : (
                  <div className="flex w-full flex-col gap-2 rounded-lg border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      {isResolvingLocation ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                          <span className="text-xs">Resolving location...</span>
                        </div>
                      ) : locationName ? (
                        <div className="flex flex-1 items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                          <p className="flex-1 text-xs leading-relaxed text-gray-700">
                            {locationName}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Unable to resolve location</p>
                      )}
                      <button
                        onClick={toggleLocation}
                        className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100 active:scale-95"
                        aria-label="Hide location"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{contactInfo}</p>
            )}
          </div>
        )}

        {!isCustomer && !isFarmer && (
          <p className="mb-4 text-sm text-gray-500">{contactInfo}</p>
        )}

        {/* Items Dropdown */}
        <div
          className={`${status === "Delivery" ? "border-green-200 bg-gray-100" : "border-green-100 bg-green-50"
            } mb-4 rounded-xl border overflow-hidden`}
        >
          <button
            onClick={toggleItems}
            className="w-full flex items-center justify-between p-4 text-left hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-semibold tracking-wide text-gray-700">
              Items ({items.length})
            </span>
            {isItemsExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {isItemsExpanded && (
            <div className="px-4 pb-4 space-y-1">
              {items.map((item, index) => (
                <OrderItem key={`${item.name}-${index}`} item={item} formatNumber={formatNumber} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Only visible for farmers */}
      {isFarmer && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {status === "Delivery" ? (
            <>
              <button
                onClick={() => handleClick("Completed")}
                className="w-full rounded-lg border border-[#0EB17C] bg-white py-2.5 font-semibold text-[#0EB17C] shadow-sm transition hover:bg-[#0EB17C] hover:text-white"
              >
                Complete
              </button>
              <button
                onClick={() => handleClick("Cancelled")}
                className="w-full rounded-lg bg-red-100 py-2.5 font-semibold text-red-700 transition hover:bg-red-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleClick("Delivery")}
                className="w-full rounded-lg bg-[#13C191] py-2.5 font-semibold text-white transition hover:opacity-90"
              >
                Delivery
              </button>
              <button
                onClick={() => handleClick("Cancelled")}
                className="w-full rounded-lg bg-red-100 py-2.5 font-semibold text-red-700 transition hover:bg-red-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

OrderCard.displayName = 'OrderCard';

export { OrderCardSkeleton };
export default OrderCard;
