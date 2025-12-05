import { useAuth } from "../../context/AuthContext";
import FarmerReportPage from "../../pages/FarmerReport";
import CustomerReportPage from "../../pages/CoustmerReport";

/**
 * DashboardReportView
 * Renders the appropriate report page based on user role within the dashboard layout
 */
const DashboardReportView = () => {
  const { user } = useAuth();

  // Render role-appropriate report
  if (user?.role === "farmer") {
    return <FarmerReportPage />;
  }

  return <CustomerReportPage />;
};

export default DashboardReportView;
