/**
 * DashboardProfileView
 * Thin wrapper component for profile display in dashboard.
 * Similar to DashboardProductsView - delegates all logic to ProfilePage.
 * - Customers: ProfilePage handles inline edit toggle
 * - Farmers: ProfilePage shows read-only view with edit navigation
 */

import { useState } from "react";
import ProfilePage from "../../pages/ProfilePage";
import LogoSpinner from "../common/LogoSpinner";

const DashboardProfileView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="relative flex min-h-[400px] flex-col py-8">
      {/* Show spinner on top if loading */}
      {loading && <LogoSpinner message="Loading Profile..." />}

      <ProfilePage isEditing={isEditing} onEditToggle={handleEditToggle} />
    </div>
  );
};

export default DashboardProfileView;
