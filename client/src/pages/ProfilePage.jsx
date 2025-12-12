import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import { getMyFarmProfile } from "../services/farmApi";
import { UserProfileView } from "../components/Profile/UserProfileView";
import { UserProfileForm } from "../components/Profile/UserProfileForm";
import { FarmProfileView } from "../components/Profile/FarmProfileView";
import LogoSpinner from "../components/common/LogoSpinner";
import { FiEdit2, FiX } from "react-icons/fi";

const getDefaultUser = () => ({
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  avatarUrl: "",
});

const getDefaultFarm = () => ({
  farmName: "",
  farmBio: "",
  location: {
    type: "Point",
    coordinates: [30.0444, 31.2357],
  },
  specialties: [],
});

/**
 * ProfilePage
 * Main profile page component that handles data fetching and display logic.
 * Similar to FarmProductsPage pattern - contains all business logic.
 * @param {boolean} isEditing - Edit mode state (for customer role)
 * @param {Function} onEditToggle - Handler to toggle edit mode (for customer role)
 */
const ProfilePage = ({ isEditing = false, onEditToggle = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user role

  // --- Split state for user and farm data ---
  const [userData, setUserData] = useState(null);
  const [farmData, setFarmData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token || !user) {
          clearAuthData();
          navigate("/login");
          return;
        }

        // --- Fetch user and (conditionally) farm data ---
        const promises = [getUserProfile()];

        // --- ROLE GUARD ---
        // Only add the farm data promise if the user is a farmer
        if (user.role === "farmer") {
          promises.push(getMyFarmProfile());
        }

        const [fetchedUser, fetchedFarm = null] = await Promise.all(promises);

        if (fetchedUser) {
          // Set User Data - normalize phone to local format
          let displayPhone = fetchedUser.phone || "";
          displayPhone = displayPhone.replace(/\D/g, "");
          if (displayPhone.startsWith("20") && displayPhone.length === 12) {
            displayPhone = "0" + displayPhone.substring(2);
          }
          if (!displayPhone.startsWith("0") && displayPhone.length === 10) {
            displayPhone = "0" + displayPhone;
          }

          setUserData({
            ...getDefaultUser(),
            ...fetchedUser,
            phoneNumber: displayPhone,
          });

          // Set Farm Data (only if fetched)
          if (fetchedFarm) {
            setFarmData({
              ...getDefaultFarm(),
              ...fetchedFarm,
              location: fetchedFarm.location || getDefaultFarm().location,
              specialties: Array.isArray(fetchedFarm.specialties) ? fetchedFarm.specialties : [],
            });
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);

        // Handle auth errors - redirect to login
        if (err.response?.status === 401) {
          clearAuthData();
          navigate("/login");
          return;
        }

        // For network errors or server down, use cached data from auth context
        if (!err.response || err.code === "ERR_NETWORK") {
          if (user) {
            // Use cached user data from auth context
            let displayPhone = user.phone || "";
            displayPhone = displayPhone.replace(/\D/g, "");
            if (displayPhone.startsWith("20") && displayPhone.length === 12) {
              displayPhone = "0" + displayPhone.substring(2);
            }
            if (!displayPhone.startsWith("0") && displayPhone.length === 10) {
              displayPhone = "0" + displayPhone;
            }

            setUserData({
              ...getDefaultUser(),
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              phoneNumber: displayPhone,
              avatarUrl: user.avatarUrl || "",
            });
          }
          toast.warning("Working offline - some data may be unavailable");
          // Don't set error for network issues
        } else {
          // For other errors, show error UI
          const errorMsg = err.response?.data?.message || "Failed to fetch profile";
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, user]); // Depend on user

  // Handle successful save - refresh data
  const handleSaveSuccess = (updatedUser) => {
    if (onEditToggle) {
      onEditToggle(); // Toggle back to view mode
    }
    // Update local userData state with the updated user info
    setUserData({
      ...getDefaultUser(),
      ...updatedUser,
      phoneNumber: updatedUser.phone || "",
    });
  };

  const handleEditClick = () => {
    // For farmers: navigate to dedicated edit page
    if (user?.role === "farmer") {
      navigate("/edit-profile");
    }
    // For customers: toggle edit mode inline (if handler provided)
    else if (onEditToggle) {
      onEditToggle();
    }
  };

  if (loading) {
    return <LogoSpinner message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mb-2 font-semibold text-red-700">Error Loading Profile</p>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 sm:px-8 md:px-12 lg:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header with Edit/Cancel button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">My Profile</h2>
          <button
            onClick={handleEditClick}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all sm:justify-start ${isEditing
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700"
              }`}
          >
            {isEditing ? (
              <>
                <FiX className="h-5 w-5" />
                Cancel
              </>
            ) : (
              <>
                <FiEdit2 className="h-5 w-5" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Content */}
        <section className="space-y-8">
          {/* Customer Role: Toggle between View and Edit inline */}
          {user?.role === "customer" && userData && (
            <>
              {isEditing ? (
                <UserProfileForm
                  initialData={userData}
                  onSaveSuccess={handleSaveSuccess}
                  key={`edit-${userData.email}`}
                />
              ) : (
                <UserProfileView userData={userData} />
              )}
            </>
          )}

          {/* Farmer Role: Always show read-only view (edit via /edit-profile route) */}
          {user?.role === "farmer" && (
            <>
              {userData && <UserProfileView userData={userData} />}
              {farmData && <FarmProfileView farmData={farmData} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;