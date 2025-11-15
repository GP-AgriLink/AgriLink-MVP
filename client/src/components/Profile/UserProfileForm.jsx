import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/userService";
import { uploadImage } from "../../services/uploadService";
import { sanitizeName, sanitizePhone } from "../../utils/sanitizers";
import { validateFile, validateEgyptianPhone } from "../../utils/validators";
import { toast } from "react-toastify";
import { Camera } from "lucide-react";
import avatarPlaceholder from "/avatar-placeholder.svg";

const NAME_REGEX = /^[a-zA-Z\u0621-\u064A\s'-]{2,50}$/;
const NAME_ERROR_MESSAGE =
  "Name can only contain letters (English or Arabic), spaces, hyphens, and apostrophes";

const getDefaultErrors = () => ({
  firstName: "",
  lastName: "",
  phoneNumber: "",
});

export const UserProfileForm = ({ initialData }) => {
  const { refreshAuthUser } = useAuth();
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState(getDefaultErrors());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initialData.avatarUrl || avatarPlaceholder);
  const localPreviewRef = useRef(null);

  // Sync form state when initialData is loaded
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setAvatarPreview(initialData.avatarUrl || avatarPlaceholder);
      // Pre-validate the loaded data
      setFormErrors({
        firstName: validateField("firstName", initialData.firstName),
        lastName: validateField("lastName", initialData.lastName),
        phoneNumber: validateField("phoneNumber", initialData.phoneNumber),
      });
    }
  }, [initialData]);

  // --- Check if form is "dirty" ---
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    // 1. A new avatar file is staged for upload
    if (avatarFile) return true;

    // 2. Text fields have changed
    if (formData.firstName !== initialData.firstName) return true;
    if (formData.lastName !== initialData.lastName) return true;
    if (formData.phoneNumber !== initialData.phoneNumber) return true;
    // 3. The avatar was removed (original had one, now it's empty)
    if (formData.avatarUrl !== initialData.avatarUrl) return true;

    return false;
  }, [formData, initialData, avatarFile]);

  const validateField = (name, value) => {
    let error = "";
    const trimmedValue = value?.trim();
    const isRequired = name === "phoneNumber";

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
      case "phoneNumber":
        if (!trimmedValue && isRequired) {
          error = "Phone number is required";
        } else if (trimmedValue && !validateEgyptianPhone(trimmedValue)) {
          error = "Please enter a valid Egyptian mobile number (e.g., 01012345678)";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const isFormValid = () => {
    const hasErrors = Object.values(formErrors).some((error) => error.length > 0);
    const isPhoneEmpty = !formData.phoneNumber?.trim();
    return !hasErrors && !isPhoneEmpty;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    });

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // --- Don't upload. Just stage the file and show a preview. ---
    setAvatarFile(file); // Stage the file for submission

    // Revoke old blob URL if one exists
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }

    // Create a new local preview URL
    const localPreviewUrl = URL.createObjectURL(file);
    localPreviewRef.current = localPreviewUrl;
    setAvatarPreview(localPreviewUrl); // Show the local preview
  };

  // --- Add a function to remove the avatar ---
  const handleRemoveAvatar = () => {
    setAvatarFile(null); // Clear staged file
    setAvatarPreview(avatarPlaceholder); // Show placeholder
    setFormData((prev) => ({ ...prev, avatarUrl: "" })); // Set URL to empty string to be saved
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid() || !isDirty) {
      toast.error("No changes to save or form is invalid.");
      return;
    }

    setIsLoading(true);
    let finalAvatarUrl = formData.avatarUrl; // Start with the current URL

    try {
      if (avatarFile) {
        setIsUploading(true);
        toast.info("Uploading avatar...");
        const response = await uploadImage(avatarFile);
        if (response && response.imageUrl) {
          finalAvatarUrl = response.imageUrl;
        } else {
          throw new Error("Avatar upload failed to return a URL.");
        }
        setIsUploading(false);
      }

      const userData = {
        firstName: sanitizeName(formData.firstName),
        lastName: sanitizeName(formData.lastName),
        phone: sanitizePhone(formData.phoneNumber),
        avatarUrl: finalAvatarUrl, // Use the final URL
      };

      const updatedUser = await updateUserProfile(userData);

      refreshAuthUser(updatedUser); // Update context and localStorage

      // Resync all state to the new server data
      setFormData(updatedUser);
      setAvatarFile(null); // Clear the staged file
      setAvatarPreview(updatedUser.avatarUrl || avatarPlaceholder);
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
      // Manually update initialData to reset dirty check
      initialData.firstName = updatedUser.firstName;
      initialData.lastName = updatedUser.lastName;
      initialData.phoneNumber = updatedUser.phone;
      initialData.avatarUrl = updatedUser.avatarUrl;

      toast.success("User profile updated successfully!");
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const baseClasses =
      "w-full px-4 py-3 border rounded-lg outline-none transition duration-300 relative";
    const hasError = formErrors[fieldName];
    const isEmpty = !formData[fieldName]?.trim();
    const isRequired = fieldName === "phoneNumber";
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
    const error = formErrors[fieldName];
    const value = formData[fieldName]?.trim();
    const isRequired = fieldName === "phoneNumber";
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
        <h2 className="mb-4 text-xl font-semibold text-gray-800">User Details</h2>

        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="relative">
            <img
              src={avatarPreview} // Use preview state
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
                disabled={isUploading || isLoading}
              />
            </label>
          </div>
          {/* --- Add Remove Avatar Button --- */}
          {avatarPreview !== avatarPlaceholder && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isUploading || isLoading}
              className="text-xs text-red-500 transition hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>

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
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isUploading || !isFormValid() || !isDirty}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Saving..." : isUploading ? "Uploading..." : "Save User Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};
