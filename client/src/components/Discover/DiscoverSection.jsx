import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_DISTANCE = 10000;
const FALLBACK_POSITION = [30.0444, 31.2357]; // Default Cairo

const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.latitude, coords.longitude], 13, {
        duration: 2,
        easeLinearity: 0.25,
      });
    }
  }, [coords, map]);
  return null;
};

const DiscoverSection = ({ onLocationSet, userCoords }) => {
  const [searchLocation, setSearchLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Your Selected Location");
  const [mapCenter, setMapCenter] = useState(FALLBACK_POSITION);

  useEffect(() => {
    if (userCoords) {
      setLocationName("Fetching address...");
      setMapCenter([userCoords.latitude, userCoords.longitude]);

      // 2. Call the API
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.latitude}&lon=${userCoords.longitude}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.address) {
            const city =
              data.address.city || data.address.town || data.address.village || data.address.state;
            const country = data.address.country;

            const displayName = city ? `${city}, ${country}` : country;

            setLocationName(displayName || "Unknown Location");
          } else {
            setLocationName("Location Found");
          }
        })
        .catch((err) => {
          console.error("Reverse geocoding failed", err);
          setLocationName("Selected Location");
        });
    }
  }, [userCoords]);

  // Handler for the "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoadingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          distance: DEFAULT_DISTANCE,
        };
        onLocationSet(coords);
        setLoadingLocation(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location.");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true, // Use GPS for accurate farm locations
        timeout: 15000, // 15s balanced timeout
        maximumAge: 60000, // Cache for 1 minute only
      }
    );
  };

  // Handler for the search bar
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchLocation) return;
    setLoadingLocation(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchLocation
        )}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coords = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          distance: DEFAULT_DISTANCE,
        };
        onLocationSet(coords);
      } else {
        setError("Location not found. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <div className="relative w-full bg-emerald-50" id="DiscoverSection">
      <div className="mx-auto max-w-2xl px-4 pt-16 text-center lg:pt-20">
        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-green-700 sm:text-sm">
          Discover
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Explore Our Farms
        </h2>
        <div className="mx-auto mt-5 h-1 w-20 bg-green-700"></div>
      </div>

      <div className="container mx-auto grid min-h-[60vh] grid-cols-1 items-center gap-12 px-4 py-12 lg:min-h-[70vh] lg:grid-cols-2 lg:py-20">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 drop-shadow-sm sm:text-5xl">
            Discover fresh produce,
            <br className="hidden sm:block" />
            grown near you.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 sm:text-xl lg:mx-0">
            Explore AgriLink's interactive farm network map. Hover or click on a marker to learn
            more about each farm, their growing practices, and shop their seasonal offerings.
          </p>

          <div className="mx-auto mt-8 max-w-lg space-y-4 sm:mt-10 lg:mx-0">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter your city or zip code"
                className="w-full rounded-full border border-gray-300 px-6 py-4 pr-14 text-base caret-emerald-200 shadow-lg focus:border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-200 sm:text-lg"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 p-2.5 text-white shadow-md transition-colors hover:bg-emerald-700 sm:p-3"
                disabled={loadingLocation}
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </form>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <span className="hidden text-gray-500 sm:inline">or</span>
              <button
                onClick={handleUseMyLocation}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-600 shadow-lg transition-all hover:shadow-xl sm:w-auto"
                disabled={loadingLocation}
              >
                <MapPin className="h-5 w-5" />
                {loadingLocation ? "Locating..." : "Use My Location"}
              </button>
            </div>

            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          </div>
        </div>

        {/* --- Map --- */}
        <div className="relative z-0 h-[400px] w-full overflow-hidden rounded-2xl shadow-lg lg:h-[50vh]">
          <MapContainer
            center={FALLBACK_POSITION}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <FlyToLocation coords={userCoords} />

            {userCoords && (
              <Marker position={[userCoords.latitude, userCoords.longitude]}>
                <Popup>{locationName}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DiscoverSection;
