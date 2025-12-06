import { useCallback, memo } from "react";
import { ShoppingBag, Package, User, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * DashboardSidebar - Optimized navigation sidebar
 * Features:
 * - Lucide-react icons for consistency
 * - Memoized handlers
 * - Role-based UI
 * - Active state from URL
 */
const DashboardSidebar = memo(({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get active view from URL: /dashboard/PROFILE -> "profile"
  const activeView = location.pathname.split("/")[2] || "profile";

  // Memoized button class helper
  const getButtonClasses = useCallback(
    (isActive) =>
      `flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-semibold transition-all ${
        isActive
          ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-md hover:-translate-y-0.5"
          : "text-emerald-900 hover:bg-emerald-50"
      }`,
    []
  );

  const handleNavigate = useCallback(
    (view) => {
      navigate(`/dashboard/${view}`);
      setIsSidebarOpen(false);
    },
    [navigate, setIsSidebarOpen]
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-[500] h-full max-h-screen min-w-72 max-w-80 flex-shrink-0 overflow-auto rounded-2xl border border-emerald-100/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "z-[50] -translate-x-full lg:translate-x-0"
      }`}
    >
      <h2
        className="mb-5 text-sm font-bold uppercase tracking-[4.2px] text-emerald-800"
        style={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          letterSpacing: "4.2px",
        }}
      >
        {user?.role === "farmer" ? "Farmer Portal" : "My Account"}
      </h2>

      <nav className="space-y-2">
        {/* Orders */}
        <button
          onClick={() => handleNavigate("orders")}
          className={getButtonClasses(activeView === "orders")}
        >
          <ShoppingBag className="h-5 w-5" />
          <span>My Orders</span>
        </button>

        {/* Products - Only for farmers */}
        {user?.role === "farmer" && (
          <button
            onClick={() => handleNavigate("products")}
            className={getButtonClasses(activeView === "products")}
          >
            <Package className="h-5 w-5" />
            <span>My Products</span>
          </button>
        )}

        {/* Profile */}
        <button
          onClick={() => handleNavigate("profile")}
          className={getButtonClasses(activeView === "profile")}
        >
          <User className="h-5 w-5" />
          <span>My Profile</span>
        </button>

        {/* Report */}
        <button
          onClick={() => handleNavigate("report")}
          className={getButtonClasses(activeView === "report")}
        >
          <FileText className="h-5 w-5" />
          <span>View Report</span>
        </button>
      </nav>
    </aside>
  );
});

DashboardSidebar.displayName = "DashboardSidebar";

export default DashboardSidebar;
