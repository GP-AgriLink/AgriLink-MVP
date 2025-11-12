import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Search } from "lucide-react";
import DistanceFilter from "../components/Discover/DistanceFilter";

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

const LocationMarker = ({ setUserLocation }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const updated = {
        latitude: lat,
        longitude: lng,
        distance: DEFAULT_DISTANCE,
      };
      setUserLocation(updated);
      console.log("Manual Location:", updated);
    },
  });
  return null;
};

const DiscoverPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCoords, setSearchCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showMap) return;

      const mapEl = mapRef.current?.getContainer();
      const isInsideMap = mapEl && mapEl.contains(e.target);
      const isButton = e.target.closest("button");
      const isInput = e.target.closest("input");

      if (!isInsideMap && !isButton && !isInput) {
        setFadeOut(true);
        setTimeout(() => {
          setShowMap(false);
          setFadeOut(false);
        }, 500);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMap]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          distance: DEFAULT_DISTANCE,
        };

        setUserLocation(loc);
        setCurrentCoords(loc);
        setShowMap(true);
        setLoadingLocation(false);

        console.log("User Location:", loc);
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location accurately.");
        setLoadingLocation(false);
        setShowMap(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchLocation) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchLocation
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coords = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          distance: DEFAULT_DISTANCE,
        };

        setSearchCoords(coords);
        setCurrentCoords(coords);
        setShowMap(true);

        console.log("Search Location:", coords);
      } else {
        alert("Location not found.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching location.");
    }
  };

  const initialCenter = currentCoords
    ? [currentCoords.latitude, currentCoords.longitude]
    : FALLBACK_POSITION;

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 relative">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Discover Local Farms</h1>
        <p className="text-gray-600">Find fresh produce and support farmers near you.</p>

        <div className="space-y-2">
          <button
            onClick={handleUseMyLocation}
            className={`px-4 py-2 rounded-lg transition-colors ${loadingLocation
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            disabled={loadingLocation}
          >
            {loadingLocation ? "Getting your location..." : "Use My Location"}
          </button>

          <form onSubmit={handleSearchSubmit}>
            <div className="relative mt-2">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onFocus={() => setShowMap(true)}
                placeholder="Search for location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {showMap && (
        <div
          className={`w-full h-96 rounded-2xl mt-6 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"
            }`}
        >
          <MapContainer
            center={initialCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full rounded-2xl"
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={[userLocation.latitude, userLocation.longitude]}>
                <Popup>Your Location</Popup>
              </Marker>
            )}

            {/* Search Location Marker */}
            {searchCoords && (
              <Marker position={[searchCoords.latitude, searchCoords.longitude]}>
                <Popup>Selected Location</Popup>
              </Marker>
            )}

            {/* Fly to currentCoords */}
            <FlyToLocation coords={currentCoords} />

            {/* Manual Location Selection */}
            <LocationMarker
              setUserLocation={(coords) => {
                setUserLocation(coords);
                setCurrentCoords(coords);
                setShowMap(true);
              }}
            />
          </MapContainer>
        </div>
      )}


      {currentCoords && (
        <div className="mt-8">
          <DistanceFilter userCoords={currentCoords} />
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;