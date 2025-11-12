// client/components/DistanceFilter.jsx
import { useState, useEffect } from "react";
import { FaSeedling } from "react-icons/fa";

const DISTANCES = [10, 25, 40, 100, Infinity]; // km

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

const DistanceFilter = ({ userCoords }) => {
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      setLoading(true);
      try {
        const url =
          !userCoords || selectedDistance === Infinity
            ? "http://localhost:5000/api/farms"
            : `http://localhost:5000/api/farms/nearby?longitude=${userCoords.longitude}&latitude=${userCoords.latitude}&distance=${selectedDistance * 1000}`;

        const res = await fetch(url);
        console.log(res);
        const data = await res.json();
        console.log("Farms from API:", data);
        setFarms(data);
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
    if (!farms.length) {
      setFilteredFarms([]);
      return;
    }

    const newFarms = farms.filter((farm) => {
      if (!userCoords || selectedDistance === Infinity) return true;

      const latitude = farm.location?.coordinates?.[1];
      const longitude = farm.location?.coordinates?.[0];

      if (latitude == null || longitude == null) return false;

      const distance = getDistanceFromLatLonInKm(
        userCoords.latitude,
        userCoords.longitude,
        latitude,
        longitude
      );

      return distance <= selectedDistance;
    });

    setFilteredFarms(newFarms);
  }, [farms, userCoords, selectedDistance]);

  const latitudes = filteredFarms.map(f => f.location?.coordinates?.[1]).filter(Boolean);
  const longitudes = filteredFarms.map(f => f.location?.coordinates?.[0]).filter(Boolean);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const padding = 0.05;
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return (
    <div className="p-4 rounded-xl shadow-lg border border-gray-200 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Nearby Farms</h2>

      {/* Distance Buttons */}
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

      {/* Scrollable Map Box */}
      <div className="relative w-full h-96 rounded-2xl bg-green-50 border border-gray-300 overflow-auto">
        <div className="relative w-[150%] h-[150%]">
          {loading && <p className="text-center text-gray-500 mt-10">Loading farms...</p>}

          {!loading && filteredFarms.length === 0 && (
            <p className="text-gray-500 text-center mt-10">No farms within selected distance.</p>
          )}

          {filteredFarms.map((farm) => {
            const latitude = farm.location?.coordinates?.[1];
            const longitude = farm.location?.coordinates?.[0];
            if (latitude == null || longitude == null) return null;

            const top = padding * 100 + ((maxLat - latitude) / latRange) * (100 - padding * 2 * 100);
            const left = padding * 100 + ((longitude - minLng) / lngRange) * (100 - padding * 2 * 100);

            const distance =
              userCoords != null
                ? getDistanceFromLatLonInKm(
                  userCoords.latitude,
                  userCoords.longitude,
                  latitude,
                  longitude
                ).toFixed(1)
                : null;

            return (
              <div
                key={farm._id}
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{ top: `${top}%`, left: `${left}%` }}
                title={`${farm.farmName} - ${farm.specialties?.join(", ") || "No info"}`}
              >
                {/* Glow Circle */}
                <div className="absolute -bottom-6 w-16 h-16 bg-green-200 rounded-full opacity-20 blur-2xl z-0"></div>

                {/* Marker Icon */}
                <FaSeedling className="text-green-600 text-5xl z-10" />

                {/* Info Box */}
                <div className="mt-2 p-3 w-44 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col items-center z-10">
                  <span className="font-semibold text-sm text-gray-800">{farm.farmName}</span>
                  <span className="text-xs text-gray-500">{farm.specialties?.join(", ") || "No info"}</span>
                  {distance && (
                    <span className="text-[10px] text-gray-400 mt-1">{distance} km away</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DistanceFilter;