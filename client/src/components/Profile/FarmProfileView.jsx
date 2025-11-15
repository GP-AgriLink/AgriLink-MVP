import React, { useState, useRef, useEffect } from "react";
import { FiMapPin, FiBriefcase, FiFileText, FiTag, FiNavigation } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Map setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapEventsHandler = ({ mapRef, setZoom }) => {
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
};

const CompactInfoItem = ({ icon: Icon, label, value, className = "" }) => {
  const renderValue = (value, defaultText = "Not provided") => {
    return value || defaultText;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs font-medium text-gray-500">{label}</p>
        <p
          className={`truncate text-sm font-semibold text-gray-900 ${!value || value === "Not provided" ? "italic text-gray-400" : ""}`}
        >
          {renderValue(value)}
        </p>
      </div>
    </div>
  );
};

export const FarmProfileView = ({ farmData }) => {
  const [currentZoom, setCurrentZoom] = useState(9);
  const mapRef = useRef(null);

  if (!farmData) return null;

  const { farmName, farmBio, specialties = [], location } = farmData;

  const renderValue = (value, defaultText = "Not provided") => {
    return value || defaultText;
  };

  const mapCenter = location?.coordinates
    ? [location.coordinates[1], location.coordinates[0]] // Leaflet: [Lat, Lng]
    : [30.0444, 31.2357]; // Cairo default

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(mapCenter, currentZoom, {
        duration: 1.5,
        easeLinearity: 0.5,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">Farm Details</h2>

        <div className="mb-6 grid grid-cols-1 gap-6 text-start md:grid-cols-2">
          <CompactInfoItem
            icon={FiBriefcase}
            label="Farm Name"
            value={farmName}
            className="md:col-span-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <FiFileText className="h-4 w-4 text-emerald-600" />
              </div>
              <label className="text-sm font-semibold text-gray-700">Farm Bio</label>
            </div>
            <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
              <p
                className={`whitespace-pre-wrap text-sm leading-relaxed text-gray-800 ${!farmBio ? "italic text-gray-400" : ""}`}
              >
                {renderValue(farmBio, "No bio provided")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <FiTag className="h-4 w-4 text-emerald-600" />
              </div>
              <label className="text-sm font-semibold text-gray-700">Specialties</label>
            </div>
            <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
              {specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">No specialties listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <FiMapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Farm Location</h3>
              <p className="text-xs text-gray-500">
                Coordinates: {mapCenter[0].toFixed(6)}°N, {mapCenter[1].toFixed(6)}°E
              </p>
            </div>
          </div>

          <button
            onClick={handleRecenter}
            className="flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg"
            title="Recenter map to farm location"
          >
            <FiNavigation className="h-4 w-4" />
            <span className="text-sm">Recenter</span>
          </button>
        </div>

        <div className="relative overflow-hidden rounded-xl border-2 border-emerald-100 shadow-lg">
          <MapContainer
            center={mapCenter}
            zoom={9}
            scrollWheelZoom={true}
            className="z-0 h-[400px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapEventsHandler mapRef={mapRef} setZoom={setCurrentZoom} />

            <Marker position={mapCenter}>
              <Popup>
                <div className="p-2 text-center">
                  <p className="mb-1 font-bold text-emerald-700">{farmName || "Farm Location"}</p>
                  <p className="text-xs text-gray-600">
                    {mapCenter[0].toFixed(6)}°N
                    <br />
                    {mapCenter[1].toFixed(6)}°E
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          <div className="absolute right-4 top-4 z-[1000] rounded-lg border border-emerald-100 bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <FiMapPin className="h-4 w-4" />
              Zoom: {currentZoom}x | Max: 19x
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
