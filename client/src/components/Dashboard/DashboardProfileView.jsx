import { useState, memo } from "react";
import ProfilePage from "../../pages/ProfilePage";

/**
 * DashboardProfileView - Memoized wrapper for profile page
 * No max-height to allow parent scrollbar to work
 */
const DashboardProfileView = memo(() => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex h-full min-h-[500px] flex-col py-6 pb-8">
      <ProfilePage isEditing={isEditing} onEditToggle={handleEditToggle} />
    </div>
  );
});

DashboardProfileView.displayName = "DashboardProfileView";

export default DashboardProfileView;
