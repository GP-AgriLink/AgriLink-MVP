import React from "react";
import { FiEdit2 } from "react-icons/fi";

/**
 * ProfileHeader
 * Displays profile page header with edit action button
 * @param {boolean} isEditing - Current edit mode state
 * @param {Function} onEditClick - Handler for edit button click
 */
const ProfileHeader = ({ isEditing, onEditClick }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          My Profile
        </h2>
      </div>
      <button
        onClick={onEditClick}
        className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm text-sm"
      >
        <FiEdit2 />
        <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
      </button>
    </div>
  );
};

export default ProfileHeader;
