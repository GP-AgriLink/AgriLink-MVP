/**
 * DashboardProfileView
 * Renders the farmer profile interface within the dashboard layout
 */

import ProfilePage from '../../pages/ProfilePage';

const DashboardProfileView = () => {
  return (
    <div className="text-center py-12 min-h-[400px] flex flex-col">
      <ProfilePage />
    </div>
  );
};

export default DashboardProfileView;
