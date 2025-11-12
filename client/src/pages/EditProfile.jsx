import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avatarPlaceholder from "/avatar-placeholder.svg";
import { Camera, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-toastify";
import { getProfile, updateProfile, uploadAvatar } from "../services/profileApi";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { sanitizeName, sanitizePhone, sanitizeTextArea, sanitizeArray } from "../utils/sanitizers";
import { validateCoordinates, validateFile } from "../utils/validators";
import { validateEgyptianPhone } from "../utils/validators";

// ... (Constants, Map components, and other functions remain the same) ...
const REDIRECT_DELAY = 1000;
const NAME_REGEX = /^[a-zA-Z\u0621-\u064A\s'-]{2,50}$/;
const FARM_NAME_REGEX = /^[a-zA-Z\u0621-\u064A\s'-]{3,100}$/;
const NAME_ERROR_MESSAGE =
  "Name can only contain letters (English or Arabic), spaces, hyphens, and apostrophes";

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

const getDefaultFormData = () => ({
  firstName: "",
  lastName: "",
  farmName: "",
  email: "",
  phoneNumber: "",
  farmBio: "",
  avatarUrl: "",
  specialties: [],
  location: { type: "Point", coordinates: [31.2357, 30.0444] },
});

const getDefaultErrors = () => ({
  firstName: "",
  lastName: "",
  farmName: "",
  phoneNumber: "",
  farmBio: "",
});

export default function EditProfile() {
  const navigate = useNavigate();
  const { updateAvatar: updateContextAvatar } = useAuth();
  const [formData, setFormData] = useState(getDefaultFormData());
  const [formErrors, setFormErrors] = useState(getDefaultErrors());
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State for avatar upload
  const locationInputRef = useRef(null);

  const allSpecialties = ["Organic", "Vegetables", "Fruits", "Herbs", "Dairy", "Grains"];

  const isRequired = (fieldName) => {
    return ["farmName", "phoneNumber"].includes(fieldName);
  };

  const validateField = (name, value) => {
    let error = "";
    const trimmedValue = value?.trim();
    const fieldIsRequired = isRequired(name);

    switch (name) {
      case "firstName":
      case "lastName":
        if (trimmedValue && !NAME_REGEX.test(trimmedValue)) {
          error = NAME_ERROR_MESSAGE;
        } else if (trimmedValue && trimmedValue.length < 2) {
          error = "Name must be at least 2 characters";
        } else if (trimmedValue && trimmedValue.length > 50) {
          error = "Name exceeds maximum length (50 characters)";
        }
        break;
      case "farmName":
        if (!trimmedValue) {
          error = "Farm name is required";
        } else if (!FARM_NAME_REGEX.test(trimmedValue)) {
          error = NAME_ERROR_MESSAGE;
        } else if (trimmedValue.length < 3) {
          error = "Farm name must be at least 3 characters";
        } else if (trimmedValue.length > 100) {
          error = "Farm name exceeds maximum length (100 characters)";
        }
        break;
      case "phoneNumber":
        if (!trimmedValue) {
          error = "Phone number is required";
        } else if (trimmedValue && !validateEgyptianPhone(trimmedValue)) {
          error = "Please enter a valid Egyptian mobile number (e.g., 01012345678, 01221234567)";
        }
        break;
      case "farmBio":
        if (trimmedValue && trimmedValue.length > 500) {
          error = "Bio exceeds maximum length (500 characters)";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // ... (isFormValid, useEffect[fetchProfileData], handleChange, Specialties handlers remain the same) ...

  const isFormValid = () => {
    const requiredFields = ["farmName", "phoneNumber"];
    const hasErrors = Object.values(formErrors).some((error) => error.length > 0);
    const isAnyRequiredFieldEmpty = requiredFields.some((field) => !formData[field]?.trim());
    return !hasErrors && !isAnyRequiredFieldEmpty;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("Please log in to edit your profile");
          clearAuthData();
          navigate("/login");
          return;
        }
        const data = await getProfile();
        if (data) {
          let displayPhone = data.phoneNumber || "";
          displayPhone = displayPhone.replace(/\D/g, "");
          if (displayPhone.startsWith("20") && displayPhone.length === 12) {
            displayPhone = "0" + displayPhone.substring(2);
          }
          if (!displayPhone.startsWith("0") && displayPhone.length === 10) {
            displayPhone = "0" + displayPhone;
          }
          const initialData = {
            ...getDefaultFormData(),
            ...data,
            phoneNumber: displayPhone,
            location: data.location || getDefaultFormData().location,
            specialties: Array.isArray(data.specialties) ? data.specialties : [],
          };
          Object.keys(initialData).forEach((key) => {
            if (initialData[key] === null || initialData[key] === undefined) {
              initialData[key] = "";
            }
          });
          setFormData(initialData);
          const initialErrors = {};
          Object.keys(getDefaultErrors()).forEach((key) => {
            initialErrors[key] = validateField(key, initialData[key]);
          });
          setFormErrors(initialErrors);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again");
          clearAuthData();
          navigate("/login");
        } else {
          toast.error("Failed to load profile data");
        }
      }
    };
    fetchProfileData();
  }, [navigate]);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB limit
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    });

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    toast.info("Uploading avatar...");
    const localPreviewUrl = URL.createObjectURL(file); // Create local preview
    const originalAvatar = formData.avatarUrl;

    try {
      // Set local preview *before* upload
      setFormData((prev) => ({ ...prev, avatarUrl: localPreviewUrl }));

      // Call the upload service (returns base64 string)
      const response = await uploadAvatar(file);

      // On success, update state with the base64 string from server
      if (response && response.avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: response.avatarUrl }));
        // Update the context so navbar updates immediately
        updateContextAvatar(response.avatarUrl);
        toast.success("Avatar uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Avatar upload failed");
      // Revert to the original avatar if upload fails
      setFormData((prev) => ({ ...prev, avatarUrl: originalAvatar || avatarPlaceholder }));
    } finally {
      setIsUploading(false);
      // Clean up the local preview URL
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = {};
    let hasError = false;
    Object.keys(getDefaultErrors()).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) hasError = true;
      allErrors[key] = error;
    });
    setFormErrors(allErrors);

    if (!isFormValid() || hasError) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsLoading(true);

    let sanitizedData = null;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Session expired. Please log in again");
        clearAuthData();
        navigate("/login");
        return;
      }

      sanitizedData = {
        farmName: sanitizeName(formData.farmName),
        phoneNumber: sanitizePhone(formData.phoneNumber),
      };

      if (formData.firstName?.trim()) {
        sanitizedData.firstName = sanitizeName(formData.firstName);
      }
      if (formData.lastName?.trim()) {
        sanitizedData.lastName = sanitizeName(formData.lastName);
      }
      if (formData.farmBio?.trim()) {
        sanitizedData.farmBio = sanitizeTextArea(formData.farmBio);
      }

      // --- THIS IS THE FIX ---
      // We ONLY send the avatarUrl (which is now a Cloudinary URL)
      // We DO NOT send the base64 string anymore.
      if (formData.avatarUrl?.trim()) {
        sanitizedData.avatarUrl = formData.avatarUrl;
      }
      // ----------------------

      if (formData.specialties && formData.specialties.length > 0) {
        sanitizedData.specialties = sanitizeArray(formData.specialties);
      }

      if (formData.location?.coordinates && formData.location.coordinates.length === 2) {
        const coordValidation = validateCoordinates(formData.location.coordinates);
        if (coordValidation.isValid) {
          sanitizedData.location = {
            type: "Point",
            coordinates: formData.location.coordinates,
          };
        } else {
          sanitizedData.location = {
            type: "Point",
            coordinates: [31.2357, 30.0444],
          };
        }
      } else {
        sanitizedData.location = {
          type: "Point",
          coordinates: [31.2357, 30.0444],
        };
      }

      const updatedProfile = await updateProfile(sanitizedData);

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/dashboard", { state: { activeView: "profile" } });
      }, REDIRECT_DELAY);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again");
        clearAuthData();
        navigate("/login");
      } else {
        const errorMsg =
          error.response?.data?.message || "Failed to update profile. Please try again";
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... (useEffect[locationInputRef], getInputClasses, ValidationStatus remain the same) ...

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
      "w-full px-4 py-3 border rounded-lg outline-none transition duration-300 relative";
    const hasError = formErrors[fieldName];
    const isEmpty = !formData[fieldName]?.trim();
    const fieldIsRequired = isRequired(fieldName);
    const isValid = !hasError && (fieldIsRequired ? !isEmpty : true);
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-2 focus:ring-red-500`;
    } else if (isValid) {
      return `${baseClasses} border-emerald-500 focus:ring-2 focus:ring-emerald-500 shadow-sm shadow-emerald-500/10`;
    } else {
      return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`;
    }
  };

  const ValidationStatus = ({ fieldName }) => {
    const error = formErrors[fieldName];
    const value = formData[fieldName]?.trim();
    const fieldIsRequired = isRequired(fieldName);
    if (error) {
      return <p className="mt-1 text-xs text-red-500 transition-opacity duration-300">{error}</p>;
    }
    if (!value && fieldIsRequired) {
      return <p className="mt-1 text-xs text-gray-500">Required field</p>;
    }
    return null;
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-2xl font-semibold text-gray-800">Edit Profile</h1>

          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="relative">
              <img
                src={formData.avatarUrl || avatarPlaceholder}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-100"
              />
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-lg transition hover:from-emerald-600 hover:to-teal-700">
                {isUploading ? (
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (Rest of the form JSX remains the same) ... */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={getInputClasses("firstName")}
                />
                <ValidationStatus fieldName="firstName" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className={getInputClasses("lastName")}
                />
                <ValidationStatus fieldName="lastName" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  placeholder="example@email.com"
                  className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  placeholder="01012345678"
                  className={getInputClasses("phoneNumber")}
                />
                <ValidationStatus fieldName="phoneNumber" />
              </div>
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
                      <option
                        key={spec}
                        value={spec}
                        disabled={formData.specialties.includes(spec)}
                      >
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
                    zoomAnimation={true}
                    maxBounds={[
                      [-90, -180],
                      [90, 180],
                    ]}
                    maxBoundsViscosity={1.0}
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
                        position={[
                          formData.location.coordinates[1],
                          formData.location.coordinates[0],
                        ]}
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

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isLoading || isUploading || !isFormValid()} // Disable save while uploading
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
