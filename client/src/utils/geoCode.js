// In-memory cache for geocoding results
const geocodeCache = new Map();
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

// Rate limiting: Track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Queue for pending requests to prevent rate limit issues
const requestQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { resolve, coords } = requestQueue.shift();
    
    // Enforce rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
    
    try {
      const result = await reverseGeocodeInternal(coords);
      resolve(result);
    } catch (error) {
      console.error("Geocoding error:", error);
      resolve(null);
    }
  }
  
  isProcessingQueue = false;
};

const reverseGeocodeInternal = async (coords) => {
  const [a, b] = coords;
  
  const candidates = [
    { lat: b, lon: a },
    { lat: a, lon: b },
  ];

  // Try each candidate with retry logic
  for (const c of candidates) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
          c.lat
        )}&lon=${encodeURIComponent(c.lon)}&format=json&accept-language=en`,
        {
          headers: {
            'User-Agent': 'AgriLink-MVP/1.0 (Educational Project)',
          },
        }
      );
      
      if (!res.ok) {
        // If first candidate fails, try the second
        continue;
      }
      
      const data = await res.json();
      const display = data?.display_name || "";
      
      if (display.length > 0) {
        return display;
      }
    } catch (error) {
      console.warn("Geocoding attempt failed:", error);
      continue;
    }
  }
  
  return null;
};

export const reverseGeocodeSmart = async (coords) => {
  if (!coords || coords.length < 2) return null;

  const a = Number(coords[0]);
  const b = Number(coords[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  // Create cache key from coordinates
  const cacheKey = `${a.toFixed(4)},${b.toFixed(4)}`;
  
  // Check cache first
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.value;
  }

  // Add to queue and return promise
  return new Promise((resolve) => {
    requestQueue.push({ resolve: async (result) => {
      // Cache the result
      geocodeCache.set(cacheKey, {
        value: result,
        timestamp: Date.now()
      });
      resolve(result);
    }, coords: [a, b] });
    
    processQueue();
  });
};
