import { memo } from "react";
import { useAuth } from "../../context/AuthContext";
import FarmerReportPage from "../../pages/FarmerReport";
import CustomerReportPage from "../../pages/CustomerReport";

/**
 * DashboardReportView - Memoized role-based report router
 * No max-height to allow parent scrollbar to work
 */
const DashboardReportView = memo(() => {
  const { user } = useAuth();

  return (
    <div className="flex h-full min-h-[500px] flex-col py-6 pb-8">
      {user?.role === "farmer" ? <FarmerReportPage /> : <CustomerReportPage />}
    </div>
  );
});

DashboardReportView.displayName = "DashboardReportView";

export default DashboardReportView;
