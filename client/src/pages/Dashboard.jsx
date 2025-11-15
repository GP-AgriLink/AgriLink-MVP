import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // useEffect for handling body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("sidebar-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    };
  }, [isSidebarOpen]);

  return (
    <div className="box-border" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed bottom-6 right-6 z-[500] rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 p-4 text-white shadow-lg transition-all hover:shadow-xl lg:hidden"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-[500] bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Component */}
          <DashboardSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

          <main className="max-h-fit flex-1">
            <div className="max-h-[90vh] min-h-fit overflow-auto rounded-2xl border border-emerald-100/70 bg-white/80 shadow-lg backdrop-blur-sm">
              {/* RENDER THE CHILD ROUTE (profile, products, or orders) */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
