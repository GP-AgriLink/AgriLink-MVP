import React from "react";
import { FiEdit2, FiUser } from "react-icons/fi";
import { uploadAvatar } from "../../services/profileApi";
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AvatarUpload = ({ profilePicture, imagePreview, isEditing, onPreviewChange, onProfileChange }) => {
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
      // 2. Start the upload (server returns base64 string)
      const updated = await uploadAvatar(file);

      // 3. On success, pass the base64 string back up
      if (updated && updated.avatarUrl) {
        onProfileChange(updated); // This updates the ProfilePage state
        // Update the context so navbar updates immediately
        updateContextAvatar(updated.avatarUrl);
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
      <div className={`relative w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-white ${isEditing ? "ring-emerald-600" : "ring-emerald-400"} ${isEditing ? "hover:ring-emerald-700" : ""} group transition-all duration-300`}>
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
            <FiUser className="w-1/2 h-1/2 text-emerald-600" />
          </div>
        )}

        {isEditing ? (
          <label className="absolute inset-0 cursor-pointer">
            <div className="w-full h-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <FiEdit2 className="w-8 h-8 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <div
            className="absolute inset-0"
            onClick={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;