import React, { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

const LocationPicker = ({ setFormData }) => {
  const normalizeCoordinates = (lng, lat) => {
    let normalizedLng = lng;
    let normalizedLat = lat;

    // Normalize longitude to -180 to 180
    normalizedLng = ((lng + 180) % 360) - 180;
    if (normalizedLng < -180) normalizedLng += 360;

    // Normalize latitude to -90 to 90
    normalizedLat = ((lat + 90) % 180) - 90;
    if (normalizedLat < -90) normalizedLat += 180;

    return [normalizedLng, normalizedLat];
  };

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Store as [longitude, latitude] (GeoJSON format)
      const [normalizedLng, normalizedLat] = normalizeCoordinates(lng, lat);
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [normalizedLng, normalizedLat],
        },
      }));
    },
  });

  return null;
};

export default LocationPicker;
