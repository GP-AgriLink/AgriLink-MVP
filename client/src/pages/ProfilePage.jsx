import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileForm from '../components/Profile/ProfileForm';
import AvatarUpload from '../components/Profile/AvatarUpload';
import { getProfile } from '../services/profileApi';
import { getAuthToken, clearAuthData, useAuth } from '../context/AuthContext';

const getDefaultProfile = () => ({
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  farmName: "",
  phoneNumber: "",
  farmBio: "",
  location: {
    type: "Point",
    coordinates: [30.0444, 31.2357],
  },
  specialties: [],
  avatarUrl: "",
});

/**
 * ProfilePage
 * Displays farmer profile information with edit capability
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { updateAvatar: updateContextAvatar } = useAuth();
  const [profile, setProfile] = useState(getDefaultProfile());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();

      if (!token) {
        clearAuthData();
        navigate("/login");
        return;
      }

      const data = await getProfile();

      if (data) {
        const profileData = {
          ...getDefaultProfile(),
          ...data,
          // Add +2 prefix to phone number if it exists and doesn't already have it
          phoneNumber: data.phoneNumber 
            ? (data.phoneNumber.startsWith('+2') ? data.phoneNumber : `+2${data.phoneNumber}`)
            : "",
          location: data.location || getDefaultProfile().location,
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
        };

        setProfile(profileData);
        setImagePreview(profileData.avatarUrl || "");
        // Update context avatar when profile loads
        if (profileData.avatarUrl) {
          updateContextAvatar(profileData.avatarUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch profile";
      setError(errorMsg);

      if (err.response?.status === 401) {
        clearAuthData();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    navigate("/edit-profile");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
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
          <p className="text-red-700 font-semibold mb-2">Error Loading Profile</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8 3xl:px-8 py-2">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <ProfileHeader isEditing={false} onEditClick={handleEditClick} />
        <div className="flex justify-center mb-8">
          <AvatarUpload
            profilePicture={profile.avatarUrl}
            imagePreview={imagePreview}
            isEditing={false}
            onPreviewChange={setImagePreview}
            onProfileChange={(updatedProfile) =>
              setProfile((prev) => ({ ...prev, ...updatedProfile }))
            }
          />
        </div>
        <ProfileForm profile={profile} isEditing={false} />
      </div>
    </div>
  );
};

export default ProfilePage;
