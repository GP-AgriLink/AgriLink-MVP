import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import { reverseGeocodeSmart } from "../../utils/geoCode.js";

const fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'>
      <rect width='100%' height='100%' fill='#cbd5d1'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-size='28'>No image</text>
    </svg>`
  );

export default function Slider({ farm, products }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const timeoutRef = useRef(null);

  // Auto-slide with fade
  useEffect(() => {
    if (!products?.length || products.length === 1) return;
    const next = () => {
      setFade(true); // start fade out
      setTimeout(() => {
        setIndex((i) => (i + 1) % products.length);
        setFade(false); // fade in new image
      }, 500); // fade duration
    };
    timeoutRef.current = setInterval(next, 4000);
    return () => clearInterval(timeoutRef.current);
  }, [products]);

  // Resolve farm location
  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      if (!farm?.location?.coordinates) {
        setLocationName("");
        return;
      }
      setIsResolvingLocation(true);
      const name = await reverseGeocodeSmart(farm.location.coordinates);
      if (mounted) {
        setLocationName(name || "");
        setIsResolvingLocation(false);
      }
    };
    resolve();
    return () => (mounted = false);
  }, [farm]);

  function resolveImageUrl(prod) {
    if (!prod) return fallbackImage;
    const candidate =
      prod.imageURL ||
      prod.imageUrl ||
      prod.image ||
      (Array.isArray(prod.images) && prod.images[0]);
    if (!candidate) return fallbackImage;
    return candidate.startsWith("http")
      ? candidate
      : `${API_BASE_URL.replace(/\/$/, "")}/${candidate.replace(/^\//, "")}`;
  }

  if (!products?.length) {
    return (
      <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          Coming Soon
        </div>
      </div>
    );
  }

  const current = products[index] || {};
  const bgUrl = resolveImageUrl(current);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96">
      <img
        key={bgUrl}
        src={bgUrl}
        alt={current.name || "Product"}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
        onError={(e) => (e.target.src = fallbackImage)}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-8 text-white">
        {farm?.farmName && (
          <div className="mb-2 inline-block self-start rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-widest backdrop-blur-sm">
            {farm.farmName}
          </div>
        )}
        <h1 className="text-3xl font-bold drop-shadow-lg sm:text-6xl">
          {current.name || "Unnamed Product"}
        </h1>
        <p className="mt-2 text-sm opacity-90 sm:text-base">
          {current.description
            ? current.description.length > 80
              ? current.description.slice(0, 80) + "..."
              : current.description
            : "Product has no description."}
        </p>

        {isResolvingLocation || locationName ? (
          <div className="mt-3 inline-block self-start rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-widest backdrop-blur-sm transition-all duration-700 ease-in-out">
            {isResolvingLocation ? "Resolving location…" : locationName}
          </div>
        ) : null}
      </div>
    </div>
  );
}
