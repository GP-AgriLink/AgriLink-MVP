import { useState, useEffect, useRef, useMemo } from "react";
import { updateMyFarmProfile } from "../../services/farmApi";
import { sanitizeName, sanitizeTextArea, sanitizeArray } from "../../utils/sanitizers";
import { validateCoordinates } from "../../utils/validators";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Map components
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({ setFormData }) {
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
      setFormData((prev) => ({
        ...prev,
        location: { type: "Point", coordinates: [lng, lat] },
      }));
    }
  }, [selectedPosition, setFormData]);

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
// End Map components

const FARM_NAME_REGEX = /^[a-zA-Z\u0621-\u064A\s'-]{3,100}$/;
const NAME_ERROR_MESSAGE =
  "Name can only contain letters (English or Arabic), spaces, hyphens, and apostrophes";

const getDefaultErrors = () => ({
  farmName: "",
  farmBio: "",
});

export const FarmProfileForm = ({ initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState(getDefaultErrors());
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const locationInputRef = useRef(null);

  const allSpecialties = ["Organic", "Vegetables", "Fruits", "Herbs", "Dairy", "Grains"];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setFormErrors({
        farmName: validateField("farmName", initialData.farmName),
        farmBio: validateField("farmBio", initialData.farmBio),
      });
    }
  }, [initialData]);

  // --- Check if form is "dirty" ---
  const isDirty = useMemo(() => {
    if (!initialData) return false;

    if (formData.farmName !== initialData.farmName) return true;
    if (formData.farmBio !== initialData.farmBio) return true;

    // Use JSON.stringify for simple, robust comparison of arrays/objects
    if (JSON.stringify(formData.specialties) !== JSON.stringify(initialData.specialties))
      return true;
    if (JSON.stringify(formData.location) !== JSON.stringify(initialData.location)) return true;

    return false;
  }, [formData, initialData]);

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
    return error;
  };

  const isFormValid = () => {
    const hasErrors = Object.values(formErrors).some((error) => error.length > 0);
    const isFarmNameEmpty = !formData.farmName?.trim();
    return !hasErrors && !isFarmNameEmpty;
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
    if (!isFormValid() || !isDirty) {
      toast.error("No changes to save or form is invalid.");
      return;
    }

    setIsLoading(true);
    try {
      const farmData = {
        farmName: sanitizeName(formData.farmName),
        farmBio: sanitizeTextArea(formData.farmBio),
        specialties: sanitizeArray(formData.specialties),
        location: { type: "Point", coordinates: [31.2357, 30.0444] }, // Default
      };

      if (formData.location?.coordinates && formData.location.coordinates.length === 2) {
        const coordValidation = validateCoordinates(formData.location.coordinates);
        if (coordValidation.isValid) {
          farmData.location = {
            type: "Point",
            coordinates: formData.location.coordinates,
          };
        }
      }

      const updatedFarm = await updateMyFarmProfile(farmData);

      // Resync state and reset dirty check
      setFormData(updatedFarm);
      initialData.farmName = updatedFarm.farmName;
      initialData.farmBio = updatedFarm.farmBio;
      initialData.specialties = updatedFarm.specialties;
      initialData.location = updatedFarm.location;

      toast.success("Farm profile updated successfully!");
    } catch (error) {
      console.error("Error updating farm profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ... (map listener unchanged) ...
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
    // ... (function unchanged) ...
    const baseClasses =
      "w-full px-4 py-3 border rounded-lg outline-none transition duration-300 relative";
    const hasError = formErrors[fieldName];
    const isEmpty = !formData[fieldName]?.trim();
    const isRequired = fieldName === "farmName";
    const isValid = !hasError && (isRequired ? !isEmpty : true);
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-2 focus:ring-red-500`;
    } else if (isValid) {
      return `${baseClasses} border-emerald-500 focus:ring-2 focus:ring-emerald-500 shadow-sm shadow-emerald-500/10`;
    } else {
      return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`;
    }
  };

  const ValidationStatus = ({ fieldName }) => {
    // ... (function unchanged) ...
    const error = formErrors[fieldName];
    const value = formData[fieldName]?.trim();
    const isRequired = fieldName === "farmName";
    if (error) {
      return <p className="mt-1 text-xs text-red-500 transition-opacity duration-300">{error}</p>;
    }
    if (!value && isRequired) {
      return <p className="mt-1 text-xs text-gray-500">Required field</p>;
    }
    return null;
  };

  if (!formData) {
    return null; // Don't render if initial data hasn't loaded
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Farm Details</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Farm Name</label>
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Specialties (max 3)
            </label>
            <div className="relative">
              <select
                onChange={(e) => handleAddSpecialty(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                value=""
              >
                <option value="" disabled>
                  Select a specialty
                </option>
                {allSpecialties.map((spec) => (
                  <option key={spec} value={spec} disabled={formData.specialties.includes(spec)}>
                    {spec}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(spec)}
                      className="text-emerald-700 transition hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Farm Bio</label>
            <textarea
              name="farmBio"
              value={formData.farmBio || ""}
              onChange={handleChange}
              placeholder="Tell us about your farm (optional, max 1000 characters)..."
              rows={3}
              className={getInputClasses("farmBio") + " resize-none"}
            ></textarea>
            <ValidationStatus fieldName="farmBio" />
          </div>
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
            <input
              ref={locationInputRef}
              type="text"
              readOnly
              value={
                formData.location?.coordinates
                  ? `Lng: ${formData.location.coordinates[0].toFixed(4)}, Lat: ${formData.location.coordinates[1].toFixed(4)}`
                  : "Click to select location on map"
              }
              className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Click the input to select your farm location on the map
            </p>
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
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker setFormData={setFormData} />
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
                      iconUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                      shadowUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                    })}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !isFormValid() || !isDirty}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Farm Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};
