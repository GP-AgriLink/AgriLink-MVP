import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import { getMyFarmProfile } from "../services/farmApi";
import { UserProfileForm } from "../components/Profile/UserProfileForm";
import { FarmProfileForm } from "../components/Profile/FarmProfileForm";
import LogoSpinner from "../components/common/LogoSpinner";
import { User, Store, ChevronRight } from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user role

  // State to hold the data for each form
  const [userData, setUserData] = useState(null);
  const [farmData, setFarmData] = useState(null);
  const [activeSection, setActiveSection] = useState("user");

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
          return;
        }

        // For network errors or server down, use cached data from auth context
        if (!err.response || err.code === "ERR_NETWORK") {
          if (user) {
            // Use cached user data
            let displayPhone = user.phone || "";
            displayPhone = displayPhone.replace(/\D/g, "");
            if (displayPhone.startsWith("20") && displayPhone.length === 12) {
              displayPhone = "0" + displayPhone.substring(2);
            }
            if (!displayPhone.startsWith("0") && displayPhone.length === 10) {
              displayPhone = "0" + displayPhone;
            }

            setUserData({
              ...defaultUser,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 px-4 py-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Compact Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Profile Settings</h1>
            <p className="mt-0.5 text-sm text-gray-600">Manage your account information</p>
          </div>
          {user?.role === "farmer" && (
            <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Farmer Account</span>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
          {user?.role === "farmer" ? (
            <div className="grid lg:grid-cols-[240px_1fr]">
              {/* Sidebar Navigation */}
              <div className="border-b border-gray-200 bg-gray-50/50 p-4 lg:border-b-0 lg:border-r">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection("user")}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                      activeSection === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4" />
                      <span>Personal Info</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${activeSection === "user" ? "rotate-90" : ""}`} />
                  </button>
                  <button
                    onClick={() => setActiveSection("farm")}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                      activeSection === "farm"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4" />
                      <span>Farm Profile</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${activeSection === "farm" ? "rotate-90" : ""}`} />
                  </button>
                </nav>
              </div>

              {/* Content Area */}
              <div className="p-6 md:p-8">
                <div className="transition-all duration-300">
                  {activeSection === "user" && userData && <UserProfileForm initialData={userData} />}
                  {activeSection === "farm" && farmData && <FarmProfileForm initialData={farmData} />}
                </div>
              </div>
            </div>
          ) : (
            // Customer view - single form
            <div className="p-6 md:p-8">
              {userData && <UserProfileForm initialData={userData} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
