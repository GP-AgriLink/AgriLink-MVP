import React from "react";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import avatarPlaceholder from "/avatar-placeholder.svg";

const CompactInfoItem = ({ icon: Icon, label, value, className = "" }) => {
  const renderValue = (value, defaultText = "Not provided") => {
    return value || defaultText;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs font-medium text-gray-500">{label}</p>
        <p
          className={`truncate text-sm font-semibold text-gray-900 ${!value || value === "Not provided" ? "italic text-gray-400" : ""}`}
        >
          {renderValue(value)}
        </p>
      </div>
    </div>
  );
};

export const UserProfileView = ({ userData }) => {
  if (!userData) return null;

  // Format phone number for display - add +2 prefix if not present
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "";
    if (phone.startsWith("+2")) return phone;
    return `+2${phone}`;
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="mb-8 flex justify-center">
        <img
          src={userData.avatarUrl || avatarPlaceholder}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 text-start md:grid-cols-2">
        <CompactInfoItem icon={FiUser} label="First Name" value={userData.firstName} />
        <CompactInfoItem icon={FiUser} label="Last Name" value={userData.lastName} />
        <CompactInfoItem icon={FiMail} label="Email" value={userData.email} />
        <CompactInfoItem icon={FiPhone} label="Phone Number" value={formatPhoneForDisplay(userData.phoneNumber)} />
      </div>
    </div>
  );
};
