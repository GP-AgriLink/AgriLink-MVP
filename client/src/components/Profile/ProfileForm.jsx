import React, { useState, useRef } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiFileText,
  FiTag,
  FiNavigation,
} from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ProfileForm = ({ profile, isEditing, onProfileUpdate }) => {
  const [currentZoom, setCurrentZoom] = useState(9);
  const mapRef = useRef(null);

  const renderValue = (value, defaultText = "Not provided") => {
    return value || defaultText;
  };

  const CompactInfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-gray-900 truncate ${!value || value === "Not provided" ? 'text-gray-400 italic' : ''}`}>
          {renderValue(value)}
        </p>
      </div>
    </div>
  );

  // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
  const mapCenter = profile.location?.coordinates 
    ? [profile.location.coordinates[1], profile.location.coordinates[0]]
    : [30.0444, 31.2357]; // Cairo, Egypt [lat, lng]

  const MapEventsHandler = () => {
    const map = useMapEvents({
      zoomend: () => {
        setCurrentZoom(map.getZoom());
      },
    });
    
    React.useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(mapCenter, currentZoom, {
        duration: 1.5,
        easeLinearity: 0.5
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Information Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-start grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <CompactInfoItem icon={FiBriefcase} label="Farm Name" value={profile.farmName} className="md:col-span-2" />
          <CompactInfoItem icon={FiUser} label="First Name" value={profile.firstName} />
          <CompactInfoItem icon={FiUser} label="Last Name" value={profile.lastName} />
          <CompactInfoItem icon={FiMail} label="Email" value={profile.email} className="md:col-span-2" />
          <CompactInfoItem icon={FiPhone} label="Phone Number" value={profile.phoneNumber} className="md:col-span-2" />
        </div>

        {/* Bio and Specialties Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          {/* Farm Bio */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                <FiFileText className="w-4 h-4 text-emerald-600" />
              </div>
              <label className="text-sm font-semibold text-gray-700">Farm Bio</label>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 min-h-[100px] border border-gray-200">
              <p className={`text-sm text-gray-800 whitespace-pre-wrap leading-relaxed ${!profile.farmBio ? 'text-gray-400 italic' : ''}`}>
                {renderValue(profile.farmBio, "No bio provided")}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                <FiTag className="w-4 h-4 text-emerald-600" />
              </div>
              <label className="text-sm font-semibold text-gray-700">Specialties</label>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 min-h-[100px] border border-gray-200">
              {profile.specialties && profile.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No specialties listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Large Detailed Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
              <FiMapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Farm Location</h3>
              <p className="text-xs text-gray-500">
                Coordinates: {mapCenter[0].toFixed(6)}°N, {mapCenter[1].toFixed(6)}°E
              </p>
            </div>
          </div>
          
          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            title="Recenter map to farm location"
          >
            <FiNavigation className="w-4 h-4" />
            <span className="text-sm">Recenter</span>
          </button>
        </div>
        
        <div className="relative rounded-xl overflow-hidden border-2 border-emerald-100 shadow-lg">
          <MapContainer
            center={mapCenter}
            zoom={9}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            keyboard={true}
            attributionControl={true}
            className="h-[400px] w-full"
            style={{ 
              background: 'linear-gradient(to bottom, #e0f2fe, #f0fdf4)',
              zIndex: 0
            }}
          >
            {/* High-detail tile layer with labels */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={3}
            />
            
            {/* Map events handler for zoom tracking */}
            <MapEventsHandler />
            
            {/* Custom marker with popup */}
            <Marker
              position={mapCenter}
              icon={L.icon({
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                iconSize: [38, 62],
                iconAnchor: [19, 62],
                popupAnchor: [0, -62],
                shadowSize: [62, 62],
                shadowAnchor: [19, 62],
              })}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-bold text-emerald-700 mb-1">{profile.farmName || "Farm Location"}</p>
                  <p className="text-xs text-gray-600">
                    {mapCenter[0].toFixed(6)}°N<br />
                    {mapCenter[1].toFixed(6)}°E
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Dynamic Map overlay info badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 z-[1000] border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Zoom: {currentZoom}x | Max: 19x
            </p>
          </div>
        </div>

        {/* Map Controls Info */}
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span className="font-medium">Drag to pan</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span className="font-medium">Scroll to zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Click marker for details</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
