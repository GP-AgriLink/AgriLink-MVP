import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import { getMyFarmProfile } from "../services/farmApi";
import { UserProfileForm } from "../components/Profile/UserProfileForm";
import { FarmProfileForm } from "../components/Profile/FarmProfileForm";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user role

  // State to hold the data for each form
  const [userData, setUserData] = useState(null);
  const [farmData, setFarmData] = useState(null);

  // Page-level loading state (for initial fetch)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default data structures
  const defaultUser = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
  };
  const defaultFarm = {
    farmName: "",
    farmBio: "",
    specialties: [],
    location: { type: "Point", coordinates: [31.2357, 30.0444] },
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token || !user) {
          toast.error("Please log in to edit your profile");
          clearAuthData();
          navigate("/login");
          return;
        }

        const promises = [getUserProfile()];
        if (user.role === "farmer") {
          promises.push(getMyFarmProfile());
        }

        const [fetchedUser, fetchedFarm = null] = await Promise.all(promises);

        if (fetchedUser) {
          // Prepare User Data
          let displayPhone = fetchedUser.phone || "";
          displayPhone = displayPhone.replace(/\D/g, "");
          if (displayPhone.startsWith("20") && displayPhone.length === 12) {
            displayPhone = "0" + displayPhone.substring(2);
          }
          if (!displayPhone.startsWith("0") && displayPhone.length === 10) {
            displayPhone = "0" + displayPhone;
          }

          setUserData({
            ...defaultUser,
            ...fetchedUser,
            phoneNumber: displayPhone,
          });

          // Prepare Farm Data
          if (user.role === "farmer" && fetchedFarm) {
            setFarmData({
              ...defaultFarm,
              ...fetchedFarm,
              location: fetchedFarm.location || defaultFarm.location,
              specialties: Array.isArray(fetchedFarm.specialties) ? fetchedFarm.specialties : [],
            });
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again");
          clearAuthData();
          navigate("/login");
        } else {
          toast.error("Failed to load profile data");
          setError("Failed to load profile data");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <h1 className="text-3xl font-semibold text-gray-800">Edit Profile</h1>

        {/* Render User Form when data is ready */}
        {userData && <UserProfileForm initialData={userData} />}

        {/* Render Farm Form when data is ready and user is a farmer */}
        {user?.role === "farmer" && farmData && <FarmProfileForm initialData={farmData} />}
      </div>
    </div>
  );
}
