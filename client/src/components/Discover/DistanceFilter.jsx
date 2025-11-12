import { useState, useEffect } from "react";
import { FaSeedling, FaMapMarkerAlt } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import "leaflet/dist/leaflet.css";

const DISTANCES = [10, 25, 40, 100, Infinity];

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function SetBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      if (
        bounds[0][0] !== Infinity &&
        bounds[0][0] !== -Infinity &&
        bounds.length > 0
      ) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      map.setView([20, 0], 2);
    }
  }, [bounds, map]);
  return null;
}

const DistanceFilter = ({ userCoords }) => {
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [farmLocations, setFarmLocations] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch farms from API
  useEffect(() => {
    const fetchFarms = async () => {
      setLoading(true);
      try {
        const url =
          !userCoords || selectedDistance === Infinity
            ? "http://localhost:5000/api/farms"
            : `http://localhost:5000/api/farms/nearby?longitude=${userCoords.longitude
            }&latitude=${userCoords.latitude}&distance=${selectedDistance * 1000
            }`;

        const res = await fetch(url);
        const responseData = await res.json();
        console.log("✅ Farms from API:", responseData);
        setFarms(responseData.data || []);
      } catch (err) {
        console.error(err);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, [userCoords, selectedDistance]);

  // Filter farms based on distance
  useEffect(() => {
    if (!farms.length) {
      setFilteredFarms([]);
      return;
    }

    const withLocation = farms.filter((f) => f.location?.coordinates);
    const isApiFiltered = userCoords && selectedDistance !== Infinity;

    if (isApiFiltered) {
      setFilteredFarms(withLocation);
    } else {
      const newFarms = withLocation.filter((farm) => {
        if (!userCoords || selectedDistance === Infinity) return true;
        const latitude = farm.location.coordinates[1];
        const longitude = farm.location.coordinates[0];
        const distance = getDistanceFromLatLonInKm(
          userCoords.latitude,
          userCoords.longitude,
          latitude,
          longitude
        );
        return distance <= selectedDistance;
      });
      setFilteredFarms(newFarms);
    }
  }, [farms, userCoords, selectedDistance]);

  // Reverse geocoding for farm locations
  useEffect(() => {
    const fetchLocations = async () => {
      const results = {};
      await Promise.all(
        filteredFarms.map(async (farm) => {

          console.log("Farm Object:", farm);
          console.log("Farm Bio:", farm.farmBio);

          const [lng, lat] = farm.location.coordinates;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            console.log(farm._id, data.address);

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

  const seedlingIcon = L.divIcon({
    html: renderToString(<FaSeedling className="text-green-600 text-5xl" />),
    className: "bg-transparent border-0",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });

  // Calculate map bounds
  const latitudes = filteredFarms
    .map((f) => f.location?.coordinates?.[1])
    .filter(Boolean);
  const longitudes = filteredFarms
    .map((f) => f.location?.coordinates?.[0])
    .filter(Boolean);

  const bounds =
    filteredFarms.length > 0
      ? [
        [Math.min(...latitudes), Math.min(...longitudes)],
        [Math.max(...latitudes), Math.max(...longitudes)],
      ]
      : null;

  return (
    <div className="p-4 rounded-xl shadow-lg border border-gray-200 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Nearby Farms</h2>

      <div className="flex gap-2 flex-wrap mb-4">
        {DISTANCES.map((dist) => (
          <button
            key={dist}
            onClick={() => setSelectedDistance(dist)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${selectedDistance === dist
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-green-100"
              }`}
          >
            {dist === Infinity ? "Show all farms" : `${dist} km`}
          </button>
        ))}
      </div>

      <div className="relative w-full h-96 rounded-2xl border border-gray-300 overflow-hidden mb-6 bg-green-50">
        <MapContainer
          className="w-full h-full"
          bounds={bounds || [[51.505, -0.09], [51.51, -0.1]]}
          scrollWheelZoom={true}
        >
          <TileLayer
            className="opacity-70"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <SetBounds bounds={bounds} />

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
                  <div className="max-w-md w-60 overflow-hidden rounded-lg p-0">
                    <div className="flex gap-1 mb-4">
                      <img
                        className="w-20 rounded-lg object-cover"
                        src={
                          farm.avatarUrl || []
                        }
                        alt={`${farm.farmName} image`}
                      />

                      <div>
                        <div className="p-4">
                          <div className="mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {farm.farmName}
                            </h3>
                            {distance && (
                              <span className="text-xs text-gray-500">
                                {distance} km away
                              </span>
                            )}
                            <p className="text-sm text-gray-600 italic mb-3">
                              {farm.farmBio ? `"${farm.farmBio}"` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="flex items-center text-sm text-gray-700 mb-3">
                      <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0" />
                      <span>{locationName}</span>
                    </div>

                    {farm.specialties?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {farm.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <a href={`/farm/${farm._id}`} target="_blank">
                      <button
                        rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-white hover:text-emerald-600 hover:shadow-lg border border-gray-200"
                      >
                        Visit Store
                      </button>
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {loading && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-75 z-[1000]">
            <p className="text-center text-gray-600 font-semibold p-4 bg-white rounded-lg shadow-lg">
              Loading farms...
            </p>
          </div>
        )}

        {!loading && filteredFarms.length === 0 && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-50 bg-opacity-75 z-[1000]">
            <p className="text-center text-gray-500 p-4 bg-white rounded-lg shadow-lg">
              No farms with location in selected distance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistanceFilter;
