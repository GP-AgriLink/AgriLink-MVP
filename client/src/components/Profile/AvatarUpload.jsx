import React from "react";
import { FiEdit2, FiUser } from "react-icons/fi";
import { uploadImage } from "../../services/uploadService";
import { updateUserProfile } from "../../services/userService";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const AvatarUpload = ({
  profilePicture,
  imagePreview,
  isEditing,
  onPreviewChange,
  onProfileChange,
}) => {
  const { updateAvatar: updateContextAvatar } = useAuth();
  const preview = imagePreview || profilePicture;

  const handleFile = async (e) => {
    if (!isEditing) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show local preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    onPreviewChange(localPreviewUrl); // Show user the selected image

    try {
      // 2. Start the upload (returns Cloudinary URL)
      const uploadResponse = await uploadImage(file); //

      if (!uploadResponse || !uploadResponse.imageUrl) {
        throw new Error("Image upload failed to return a URL.");
      }

      // 3. Update the user's profile with the new URL
      const updatedUser = await updateUserProfile({ avatarUrl: uploadResponse.imageUrl }); //

      // 4. On success, pass the updated user object back up
      if (updatedUser && updatedUser.avatarUrl) {
        onProfileChange(updatedUser); // This updates the ProfilePage state
        // Update the context so navbar updates immediately
        updateContextAvatar(updatedUser.avatarUrl); //
        toast.success("Avatar updated successfully!");
      }
    } catch (err) {
      console.error("uploadAvatar:", err);
      toast.error(err.message || "Avatar upload failed");
      onPreviewChange(profilePicture); // Revert to original picture on failure
    } finally {
      // Revoke the local URL to prevent memory leaks
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  return (
    <div className="relative">
      <div
        className={`relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-white md:h-40 md:w-40 ${isEditing ? "ring-emerald-600" : "ring-emerald-400"} ${isEditing ? "hover:ring-emerald-700" : ""} group transition-all duration-300`}
      >
        {preview ? (
          <img src={preview} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-100">
            <FiUser className="h-1/2 w-1/2 text-emerald-600" />
          </div>
        )}

        {isEditing ? (
          <label className="absolute inset-0 cursor-pointer">
            <div className="flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <FiEdit2 className="h-8 w-8 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <div className="absolute inset-0" onClick={(e) => e.preventDefault()} />
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
