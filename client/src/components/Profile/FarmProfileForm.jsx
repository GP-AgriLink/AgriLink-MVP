import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { updateMyFarmProfile } from "../../services/farmApi";
import { sanitizeName, sanitizeTextArea, sanitizeArray } from "../../utils/sanitizers";
import { validateCoordinates } from "../../utils/validators";
import { reverseGeocodeSmart } from "../../utils/geoCode";
import { toast } from "react-toastify";
import { X, Sparkles } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { generateFarmBio } from "../../services/aiService";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({ setFormData, setFormErrors, validateLocationField, setLocationName }) {
  const [marker, setMarker] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const normalizeCoordinates = (lng, lat) => {
    let normalizedLng = lng;
    let normalizedLat = lat;
    normalizedLng = ((lng + 180) % 360) - 180;
    if (normalizedLng < -180) normalizedLng += 360;
    normalizedLat = ((lat + 90) % 180) - 90;
    if (normalizedLat < -90) normalizedLat += 180;
    return [normalizedLng, normalizedLat];
  };

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const [normalizedLng, normalizedLat] = normalizeCoordinates(lng, lat);
      setSelectedPosition([normalizedLng, normalizedLat]);
      setMarker([normalizedLat, normalizedLng]);
    },
  });

  useEffect(() => {
    if (selectedPosition) {
      const [lng, lat] = selectedPosition;
      const newLocation = { type: "Point", coordinates: [lng, lat] };

      setFormData((prev) => ({
        ...prev,
        location: newLocation,
      }));

      try {
        localStorage.setItem("agrillink_farm_location", JSON.stringify(newLocation));
        localStorage.setItem("agrillink_farm_location_unsaved", "1");
      } catch (err) {
        console.error("localStorage write error:", err);
      }

      const fetchName = async () => {
        try {
          const name = await reverseGeocodeSmart([lng, lat]);
          if (name && setLocationName) {
            setLocationName(name);
            try {
              localStorage.setItem("agrillink_farm_location_name", name);
            } catch (err) {
              console.error("localStorage write error:", err);
            }
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      };
      fetchName();

      const error = validateLocationField(newLocation);
      setFormErrors((prev) => ({ ...prev, location: error }));
    }
  }, [selectedPosition, setFormData, setFormErrors, validateLocationField, setLocationName]);

  return marker ? <Marker position={marker} /> : null;
}

function FlyToLocation({ coordinates }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, 13, { duration: 1.2 });
    }
  }, [coordinates, map]);
  return null;
}

const FARM_NAME_REGEX = /^[a-zA-Z\u0621-\u064A\s'-]{3,100}$/;
const NAME_ERROR_MESSAGE = "Name can only contain letters (English or Arabic), spaces, hyphens, and apostrophes";

const getDefaultErrors = () => ({
  farmName: "",
  farmBio: "",
  location: "",
});

export const FarmProfileForm = ({ initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState(getDefaultErrors());
  const [locationName, setLocationName] = useState(
    initialData?.locationAddress || initialData?.locationName || initialData?.address || ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const locationInputRef = useRef(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const allSpecialties = ["Organic", "Vegetables", "Fruits", "Herbs", "Dairy", "Grains"];

  // AI Handler for Farm Bio
  const handleGenerateFarmBio = useCallback(async () => {
    if (!formData.farmName.trim()) {
      toast.warning("Please enter a farm name first");
      return;
    }

    setIsAIGenerating(true);
    try {
      const bio = await generateFarmBio(
        formData.farmName,
        locationName || null,
        formData.specialties,
        formData.farmBio // Pass existing bio if any
      );
      setFormData((prev) => ({ ...prev, farmBio: bio }));
      toast.success("Farm bio generated!");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error(error.message || "Failed to generate farm bio");
    } finally {
      setIsAIGenerating(false);
    }
  }, [formData.farmName, locationName, formData.specialties, formData.farmBio]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const pickAddress =
        initialData.locationAddress ||
        initialData.locationName ||
        initialData.address ||
        initialData.location?.address ||
        initialData.location?.displayName ||
        "";

      if (pickAddress) setLocationName(pickAddress);
      setFormErrors({
        farmName: validateField("farmName", initialData.farmName),
        farmBio: validateField("farmBio", initialData.farmBio),
        location: validateLocationField(initialData.location),
      });
      let restoredFromLocal = false;
      try {
        const unsaved = localStorage.getItem("agrillink_farm_location_unsaved");
        if (unsaved === "1") {
          const stored = localStorage.getItem("agrillink_farm_location");
          const storedName = localStorage.getItem("agrillink_farm_location_name") || "";
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.coordinates && parsed.coordinates.length === 2) {
              setFormData((prev) => ({ ...prev, location: parsed }));
              if (storedName) setLocationName(storedName);
              setFormErrors((prev) => ({ ...prev, location: validateLocationField(parsed) }));
              restoredFromLocal = true;
            }
          }
        }
      } catch (err) {
        console.error("localStorage read error:", err);
      }

      if (!restoredFromLocal && initialData.location && initialData.location.coordinates && initialData.location.coordinates.length === 2) {
        if (pickAddress) {
          setLocationName(pickAddress);
        } else {
          (async () => {
            try {
              const coords = initialData.location.coordinates;
              const name = await reverseGeocodeSmart(coords);
              if (name) setLocationName(name);
            } catch (err) {
              console.error("reverse geocode on mount failed:", err);
            }
          })();
        }
      }
    }
  }, [initialData]);

  useEffect(() => {
    const coords = formData?.location?.coordinates;
    if (!coords || coords.length !== 2) return;
    if (locationName && locationName.length > 0) return;

    try {
      const storedName = localStorage.getItem("agrillink_farm_location_name");
      if (storedName) {
        setLocationName(storedName);
        return;
      }
    } catch (err) {
    }

    (async () => {
      try {
        const name = await reverseGeocodeSmart(coords);
        if (name) setLocationName(name);
      } catch (err) {
        console.error("reverse geocode on location change failed:", err);
      }
    })();
  }, [formData?.location]);

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    if (formData.farmName !== initialData.farmName) return true;
    if (formData.farmBio !== initialData.farmBio) return true;
    if (JSON.stringify(formData.specialties) !== JSON.stringify(initialData.specialties)) return true;
    if (JSON.stringify(formData.location) !== JSON.stringify(initialData.location)) return true;

    if (locationName !== initialData.locationAddress) return true;

    return false;
  }, [formData, initialData, locationName]);

  const validateLocationField = useCallback((location) => {
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return "Location is required - please select your farm location on the map";
    }
    const coordValidation = validateCoordinates(location.coordinates);
    if (!coordValidation.isValid) {
      return "Invalid location coordinates";
    }
    return "";
  }, []);

  const validateField = (name, value) => {
    let error = "";
    const trimmedValue = value?.trim();

    switch (name) {
      case "farmName":
        if (!trimmedValue) {
          error = "Farm name is required";
        } else if (trimmedValue && !FARM_NAME_REGEX.test(trimmedValue)) {
          error = NAME_ERROR_MESSAGE;
        } else if (trimmedValue && trimmedValue.length < 3) {
          error = "Farm name must be at least 3 characters";
        } else if (trimmedValue && trimmedValue.length > 100) {
          error = "Farm name exceeds maximum length (100 characters)";
        }
        break;
      case "farmBio":
        if (trimmedValue && trimmedValue.length > 1000) {
          error = "Bio exceeds maximum length (1000 characters)";
        }
        break;
      default:
        break;
    }

    if (name === "farmName") {
      if (!trimmedValue) error = "Farm name is required";
      else if (!FARM_NAME_REGEX.test(trimmedValue)) error = NAME_ERROR_MESSAGE;
    }
    return error;
  };

  const isFormValid = () => {
    const hasErrors = Object.values(formErrors).some((error) => error.length > 0);
    const isFarmNameEmpty = !formData.farmName?.trim();
    const isLocationMissing =
      !formData.location?.coordinates || formData.location.coordinates.length !== 2;
    return !hasErrors && !isFarmNameEmpty && !isLocationMissing;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAddSpecialty = (specialty) => {
    if (!specialty) return;
    const sanitizedSpecialty = sanitizeName(specialty);
    if (!sanitizedSpecialty) return;
    if (formData.specialties.includes(sanitizedSpecialty)) return;
    if (formData.specialties.length >= 3) {
      toast.warning("You can select up to 3 specialties only!");
      return;
    }
    setFormData({ ...formData, specialties: [...formData.specialties, sanitizedSpecialty] });
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== specialty) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("No changes to save or form is invalid.");
      return;
    }

    setIsLoading(true);
    try {
      const farmDataToSave = {
        farmName: sanitizeName(formData.farmName),
        farmBio: sanitizeTextArea(formData.farmBio),
        specialties: sanitizeArray(formData.specialties),
        location: formData.location,
        locationAddress: locationName
      };

      if (formData.location?.coordinates && formData.location.coordinates.length === 2) {
        const coordValidation = validateCoordinates(formData.location.coordinates);
        if (coordValidation.isValid) {
          farmDataToSave.location = {
            type: "Point",
            coordinates: formData.location.coordinates,
          };
        }
      }

      const updatedFarm = await updateMyFarmProfile(farmDataToSave);

      setFormData(updatedFarm);

      try {
        if (updatedFarm.locationAddress) {
          setLocationName(updatedFarm.locationAddress);
        } else if (updatedFarm.location && updatedFarm.location.coordinates && updatedFarm.location.coordinates.length === 2) {
          const name = await reverseGeocodeSmart(updatedFarm.location.coordinates);
          if (name) setLocationName(name);
        }
      } catch (err) {
        console.error("reverse geocode after save failed:", err);
      }

      initialData.farmName = updatedFarm.farmName;
      initialData.farmBio = updatedFarm.farmBio;
      initialData.specialties = updatedFarm.specialties;
      initialData.location = updatedFarm.location;
      initialData.locationAddress = locationName;

      try {
        localStorage.removeItem("agrillink_farm_location");
        localStorage.removeItem("agrillink_farm_location_name");
        localStorage.removeItem("agrillink_farm_location_unsaved");
      } catch (err) {
        console.error("localStorage remove error:", err);
      }

      toast.success("Farm profile updated successfully!");
    } catch (error) {
      console.error("Error updating farm profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const input = locationInputRef.current;
    if (input) {
      const focusHandler = () => setShowMap(true);
      input.addEventListener("focus", focusHandler);
      const clickOutsideHandler = (e) => {
        if (
          locationInputRef.current &&
          !locationInputRef.current.contains(e.target) &&
          !document.querySelector(".leaflet-container")?.contains(e.target)
        ) {
          setShowMap(false);
        }
      };
      document.addEventListener("click", clickOutsideHandler);
      return () => {
        input.removeEventListener("focus", focusHandler);
        document.removeEventListener("click", clickOutsideHandler);
      };
    }
  }, [locationInputRef]);

  const getInputClasses = (fieldName) => {
    const baseClasses =
      "w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition duration-200 relative";
    const hasError = formErrors[fieldName];
    const isEmpty = !formData[fieldName]?.trim();
    const isRequired = fieldName === "farmName";
    const isValid = !hasError && (isRequired ? !isEmpty : true);
    if (hasError) {
      return `${baseClasses} border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400`;
    } else if (isValid) {
      return `${baseClasses} border-emerald-400 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-400`;
    } else {
      return `${baseClasses} border-gray-200 bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400`;
    }
  };

  const ValidationStatus = ({ fieldName }) => {
    const error = formErrors[fieldName];
    const value = formData[fieldName]?.trim();
    const isRequired = fieldName === "farmName";
    if (error) return <p className="mt-1 text-xs text-red-500 transition-opacity duration-300">{error}</p>;
    if (!value && isRequired) return <p className="mt-1 text-xs text-gray-500">Required field</p>;
    return null;
  };

  if (!formData) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
            Farm Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="farmName"
            value={formData.farmName || ""}
            onChange={handleChange}
            placeholder="Enter your farm name"
            className={getInputClasses("farmName")}
          />
          <ValidationStatus fieldName="farmName" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
            Specialties (max 3)
          </label>
          <select
            onChange={(e) => handleAddSpecialty(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400"
            value=""
          >
            <option value="" disabled>Select a specialty</option>
            {allSpecialties.map((spec) => (
              <option key={spec} value={spec} disabled={formData.specialties.includes(spec)}>
                {spec}
              </option>
            ))}
          </select>
          {formData.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {formData.specialties.map((spec) => (
                <span
                  key={spec}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialty(spec)}
                    className="text-emerald-600 transition hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
          <span>Farm Bio</span>
          <button
            type="button"
            onClick={handleGenerateFarmBio}
            disabled={isAIGenerating || !formData.farmName.trim()}
            className="group flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs font-medium normal-case text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            title={formData.farmBio ? "Polish Farm Bio with AI" : "Generate Farm Bio with AI"}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${isAIGenerating ? "animate-spin" : "group-hover:animate-pulse"}`}
            />
            AI {formData.farmBio ? "Polish" : "Generate"}
          </button>
        </label>
        <textarea
          name="farmBio"
          value={formData.farmBio || ""}
          onChange={handleChange}
          placeholder="Tell us about your farm..."
          rows={3}
          className={getInputClasses("farmBio") + " resize-none"}
        ></textarea>
        <ValidationStatus fieldName="farmBio" />
      </div>

      <div className="relative">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
          Farm Location <span className="text-red-500">*</span>
        </label>
        <input
          ref={locationInputRef}
          type="text"
          readOnly
          value={
            locationName && locationName.length > 0
              ? locationName
              : formData.location?.coordinates
                ? "Location Selected"
                : "Click to select location on map"
          }
          className={`w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-sm outline-none transition ${formErrors.location
            ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400"
            : formData.location?.coordinates
              ? "border-emerald-400 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-400"
              : "border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400"
            }`}
        />
        {formErrors.location ? (
          <p className="mt-1 text-xs text-red-500 transition-opacity duration-300">
            {formErrors.location}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Click the input to select your farm location on the map</p>
        )}
        <div
          className={`mt-3 overflow-hidden transition-all duration-500 ease-in-out ${showMap ? "max-h-[320px] scale-100 opacity-100" : "pointer-events-none max-h-0 scale-95 opacity-0"}`}
        >
          <MapContainer
            center={
              formData.location.coordinates
                ? [formData.location.coordinates[1], formData.location.coordinates[0]]
                : [30.0444, 31.2357]
            }
            zoom={13}
            scrollWheelZoom={true}
            className="relative z-10 h-80 w-full rounded-lg"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <LocationPicker
              setFormData={setFormData}
              setFormErrors={setFormErrors}
              validateLocationField={validateLocationField}
              setLocationName={setLocationName}
            />

            <FlyToLocation
              coordinates={
                formData.location.coordinates
                  ? [formData.location.coordinates[1], formData.location.coordinates[0]]
                  : null
              }
            />
            {formData.location?.coordinates && (
              <Marker
                position={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                icon={L.icon({
                  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              />
            )}
          </MapContainer>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isLoading || !isFormValid() || !isDirty}
          className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};