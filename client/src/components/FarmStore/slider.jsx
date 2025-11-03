import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

export default function Slider() {
  const [products, setProducts] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const timeoutRef = useRef(null);

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://agrilink-server.vercel.app";

  const params = useParams();
  // allow farmId to be passed in the URL as /slider/:farmId
  const farmId = params.farmId || params.id || "690301ce0ad804170c5f2571";
  // fetch farm name separately so we can display it even when products don't include populated farm
  const [farmNameFromApi, setFarmNameFromApi] = useState("Unknown Farm");

  useEffect(() => {
    const controller = new AbortController();
    async function fetchFarmName() {
      try {
        const res = await fetch(`${API_BASE}/api/farms/${farmId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Fetch farm failed: ${res.status}`);
        const data = await res.json();
        // farm object may have farmName or name
        setFarmNameFromApi(
          data.farmName ||
            data.name ||
            data.farmName ||
            data.farm?.name ||
            "Unknown Farm"
        );
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }

    fetchFarmName();
    return () => controller.abort();
  }, [API_BASE, farmId]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/products/farm/${farmId}`, {
          signal: controller.signal,
        });
        // Treat 404 as "no products" for guests/default-farm so the UI shows Coming Soon
        if (res.status === 404) {
          setProducts([]);
          return;
        }
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [API_BASE, farmId]);

  useEffect(() => {
    if (!products.length) return;
    const next = () => setIndex((i) => (i + 1) % products.length);
    timeoutRef.current = setInterval(next, 3000);
    return () => clearInterval(timeoutRef.current);
  }, [products]);

  if (loading)
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl flex items-center justify-center bg-gray-100">
        <span className="text-gray-500">Loading products…</span>
      </div>
    );

  if (error)
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl flex items-center justify-center bg-red-50">
        <span className="text-red-600">Error loading products: {error}</span>
      </div>
    );

  // If there are no products, render a single "Coming Soon" slide using the farm name fetched
  if (!products.length) {
    const comingTitle = "Coming Soon";
    const comingDesc = "This farm has no products yet. Check back soon.";
    const comingFarmName = farmNameFromApi || "Unknown Farm";

    // use the same inline SVG fallback for background
    return (
      <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg">
        <img
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = fallbackImage;
            setImgLoaded(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            imgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"
          }`}
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white transition-all duration-500">
          <div className="uppercase text-xs tracking-widest mb-2">
            {comingTitle}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">{comingFarmName}</h1>
          <p className="text-sm sm:text-base mt-3 line-clamp-2">{comingDesc}</p>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            className={`w-3 h-3 rounded-full transition-all duration-300 bg-white`}
          />
        </div>
      </div>
    );
  }

  const current = products[index];

  // safe fallback as an inline SVG data-URI (avoids requesting missing /images/default.jpg)
  const fallbackImage =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="100%" height="100%" fill="#cbd5d1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-size="28">No image</text></svg>'
    );

  function resolveImageUrl(prod) {
    if (!prod) return fallbackImage;
    const candidate =
      prod.imageURL ||
      prod.imageUrl ||
      prod.image ||
      prod.image_url ||
      (Array.isArray(prod.images) && prod.images[0]) ||
      prod.images?.[0];

    if (!candidate) return fallbackImage;
    if (typeof candidate === "string") {
      return candidate.startsWith("http")
        ? candidate
        : `${API_BASE.replace(/\/$/, "")}/${candidate.replace(/^\//, "")}`;
    }
    if (typeof candidate === "object") {
      const url =
        candidate.url ||
        candidate.secure_url ||
        candidate.path ||
        candidate.src;
      if (url)
        return url.startsWith("http")
          ? url
          : `${API_BASE.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
    }
    return fallbackImage;
  }

  const bgUrl = resolveImageUrl(current);

  return (
    <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg">
      {/* 🖼️ Background image with blur fallback */}
      <img
        src={bgUrl}
        alt={current.name}
        onLoad={() => setImgLoaded(true)}
        onError={(e) => {
          e.target.src = fallbackImage;
          setImgLoaded(true);
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
          imgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"
        }`}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white transition-all duration-500">
        <div className="uppercase text-xs tracking-widest mb-2">
          Featured Product
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">{current.name}</h1>
        <p className="text-sm sm:text-base mt-1 line-clamp-2">
          {current.description}
        </p>

        {/* Farm name (from farm API if available) */}
        <div className="mt-2 text-sm opacity-90">
          {farmNameFromApi ||
            current.farm?.name ||
            current.farmName ||
            "Unknown Farm"}
        </div>
      </div>

      {/* 🔘 Slider dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              setImgLoaded(false); // reset blur state when changing slide
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
