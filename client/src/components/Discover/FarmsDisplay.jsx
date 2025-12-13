import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { FaSeedling, FaMapMarkerAlt } from "react-icons/fa";
import { getNearbyFarms, getAllFarms } from "../../services/farmApi";
import "leaflet/dist/leaflet.css";

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function SetBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      if (bounds[0][0] !== Infinity && bounds[0][0] !== -Infinity && bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      map.setView([20, 0], 2);
    }
  }, [bounds, map]);
  return null;
}

const DISTANCES = [10, 25, 40, 100, Infinity];

// Custom icon
const seedlingIcon = L.divIcon({
  html: renderToString(<FaSeedling className="text-5xl text-green-600" />),
  className: "bg-transparent border-0",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

const FarmsDisplay = ({ userCoords }) => {
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [farmLocations, setFarmLocations] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("Your Selected Location");

  // Fetch farms from API
  useEffect(() => {
    if (!userCoords) return;
    const fetchFarms = async () => {
      setLoading(true);
      try {
        let farmsData;
        if (selectedDistance === Infinity) {
          farmsData = await getAllFarms();
        } else {
          farmsData = await getNearbyFarms({
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
            distance: selectedDistance * 1000,
          });
        }
        setFarms(farmsData);
      } catch (err) {
        console.error(err);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, [userCoords, selectedDistance]);

  useEffect(() => {
    if (userCoords) {
      setLocationName("Fetching address...");

      // 2. Call the API
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.latitude}&lon=${userCoords.longitude}`
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

  // Client-side filtering
  useEffect(() => {
    if (!farms.length) {
      setFilteredFarms([]);
      return;
    }
    const withLocation = farms.filter((f) => f.location?.coordinates);
    setFilteredFarms(withLocation);
  }, [farms]);

  // Reverse geocoding for farm locations
  useEffect(() => {
    const fetchLocations = async () => {
      const results = {};
      await Promise.all(
        filteredFarms.map(async (farm) => {
          const [lng, lat] = farm.location.coordinates;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            results[farm._id] =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              data.address?.state ||
              data.address?.region ||
              data.address?.country ||
              "Unknown Location";
          } catch (err) {
            results[farm._id] = "Unknown Location";
          }
        })
      );
      setFarmLocations(results);
    };

    if (filteredFarms.length > 0) fetchLocations();
  }, [filteredFarms]);

  // Calculate map bounds
  const latitudes = filteredFarms.map((f) => f.location?.coordinates?.[1]).filter(Boolean);
  const longitudes = filteredFarms.map((f) => f.location?.coordinates?.[0]).filter(Boolean);

  const bounds =
    filteredFarms.length > 0
      ? [
          [Math.min(...latitudes), Math.min(...longitudes)],
          [Math.max(...latitudes), Math.max(...longitudes)],
        ]
      : null;

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="mb-6 text-3xl font-bold text-gray-900">Farms Near You</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {DISTANCES.map((dist) => (
          <button
            key={dist}
            onClick={() => setSelectedDistance(dist)}
            className={`rounded-full px-5 py-2 font-semibold transition ${
              selectedDistance === dist
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {dist === Infinity ? "Show all farms" : `Within ${dist} km`}
          </button>
        ))}
      </div>

      <div className="relative z-0 h-[50vh] w-full rounded-2xl shadow-lg">
        {loading && (
          <div className="absolute left-0 top-0 z-[1000] flex h-full w-full items-center justify-center rounded-2xl bg-white bg-opacity-75">
            <p className="text-gray-600">Loading farms...</p>
          </div>
        )}

        {!loading && filteredFarms.length === 0 && (
          <div className="absolute left-0 top-0 z-[1000] flex h-full w-full items-center justify-center rounded-2xl bg-gray-50 bg-opacity-75">
            <p className="text-gray-500">No farms found within the selected distance.</p>
          </div>
        )}

        <MapContainer
          className="h-full w-full rounded-2xl bg-green-800"
          bounds={bounds || [[userCoords.latitude, userCoords.longitude]]}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <SetBounds bounds={bounds} />

          {userCoords && (
            <Marker position={[userCoords.latitude, userCoords.longitude]}>
              <Popup>{locationName}</Popup>
            </Marker>
          )}

          {filteredFarms.map((farm) => {
            const [lng, lat] = farm.location.coordinates;
            const distance =
              userCoords != null
                ? getDistanceFromLatLonInKm(
                    userCoords.latitude,
                    userCoords.longitude,
                    lat,
                    lng
                  ).toFixed(1)
                : null;
            const locationName = farmLocations[farm._id] || "Loading...";

            return (
              <Marker key={farm._id} position={[lat, lng]} icon={seedlingIcon}>
                <Popup>
                  <div className="w-60 max-w-md overflow-hidden rounded-lg p-0">
                    <div className="mb-4 flex gap-1">
                      <div>
                        <div className="p-4">
                          <div className="mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{farm.farmName}</h3>
                            {distance && (
                              <span className="text-xs text-gray-500">{distance} km away</span>
                            )}
                            <p className="mb-3 text-sm italic text-gray-600">
                              {farm.farmBio ? `"${farm.farmBio}"` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center px-1 text-sm text-gray-700">
                      <FaMapMarkerAlt className="mr-2 flex-shrink-0 text-gray-400" />
                      <span>{locationName}</span>
                    </div>

                    {farm.specialties?.length > 0 && (
                      <div className="mb-4 px-1">
                        <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500">
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {farm.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <a href={`/farm/${farm._id}`} rel="noopener noreferrer">
                      <button className="block w-full rounded-lg border border-gray-200 bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:bg-white hover:text-emerald-600 hover:shadow-lg">
                        Visit Store
                      </button>
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <style>
            {`
              .leaflet-popup-content-wrapper {
                border: 1px solid #d1d5db;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                background: #F0FDFB;
              }
              .leaflet-popup-content-wrapper:hover {
                outline: none;
                border-color: #10b981;
                box-shadow: 0 0 0 2px #10b98140;
              }
              .leaflet-popup-close-button{
                padding: 1rem 2rem;
              }
            `}
          </style>
        </MapContainer>
      </div>
    </div>
  );
};

export default FarmsDisplay;
