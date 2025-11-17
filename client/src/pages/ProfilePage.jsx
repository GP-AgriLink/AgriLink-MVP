import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../components/Profile/ProfileHeader";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import { getMyFarmProfile } from "../services/farmApi";
import { UserProfileView } from "../components/Profile/UserProfileView";
import { FarmProfileView } from "../components/Profile/FarmProfileView";
import LogoSpinner from "../components/common/LogoSpinner";

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
 * Container component that fetches data and displays profile information.
 * Implements role-based guards to show/hide farm data.
 */
const ProfilePage = () => {
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
          // Set User Data
          setUserData({
            ...getDefaultUser(),
            ...fetchedUser,
            phoneNumber: fetchedUser.phone
              ? fetchedUser.phone.startsWith("+2")
                ? fetchedUser.phone
                : `+2${fetchedUser.phone}`
              : "",
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

  const handleEditClick = () => {
    navigate("/edit-profile");
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
    <div className="min-h-screen px-4 py-2 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8 3xl:px-8">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <ProfileHeader isEditing={false} onEditClick={handleEditClick} />

        {/* Render User View Component */}
        {userData && <UserProfileView userData={userData} />}

        {/* --- ROLE GUARD --- */}
        {/* Render Farm View Component only if user is a farmer and data exists */}
        {user?.role === "farmer" && farmData && <FarmProfileView farmData={farmData} />}
      </div>
    </div>
  );
};

export default ProfilePage;
