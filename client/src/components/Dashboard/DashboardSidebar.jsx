import React from "react";
import { ChevronDown } from "lucide-react";

// Helper component for the accordion buttons
const AccordionItem = ({
  viewName,
  label,
  icon,
  filters,
  activeView,
  setActiveView,
  activeFilter,
  setActiveFilter,
  openAccordion,
  setOpenAccordion,
  closeMobileMenu,
}) => {
  const isOpen = openAccordion === viewName;

  const handleMainClick = () => {
    // If it's already open, close it. Otherwise, open it.
    if (isOpen) {
      setOpenAccordion("");
      // Don't change view or filter if just closing
    } else {
      setOpenAccordion(viewName);
      setActiveView(viewName);
      // Set to the first filter by default when opening
      if (filters && filters.length > 0 && !activeFilter) {
        setActiveFilter(filters[0].id);
      }
    }
    // Note: We don't close mobile menu here, as user might just be opening accordion
  };

  const handleFilterClick = (filterId) => {
    setActiveView(viewName); // Ensure main view is set
    setOpenAccordion(viewName); // Ensure accordion stays open
    setActiveFilter(filterId);
    closeMobileMenu(); // Close mobile menu on final selection
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleMainClick}
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 font-semibold transition-all ${
          activeView === viewName
            ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-md hover:-translate-y-0.5"
            : "text-emerald-900 hover:bg-emerald-50"
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {/* Updated Icon */}
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Accordion Content (Sub-filters) */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="space-y-1 py-1 pl-7 pr-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              /* Updated styles to match parent */
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-md"
                  : "text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Sidebar Component
const DashboardSidebar = ({
  activeView,
  setActiveView,
  activeFilter,
  setActiveFilter,
  openAccordion,
  setOpenAccordion,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const getIcon = (iconType) => {
    switch (iconType) {
      case "orders":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        );
      case "products":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        );
      case "profile":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="5"></circle>
            <path d="M20 21a8 8 0 0 0-16 0"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const orderFilters = [
    { id: "incoming", label: "Incoming" },
    { id: "delivery", label: "Delivery" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const productFilters = [
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "archived", label: "Archived" },
  ];

  const handleProfileClick = () => {
    setActiveView("profile");
    setOpenAccordion(""); // Close accordions
    setActiveFilter(null);
    setIsSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-[500] h-full max-h-[90vh] min-h-[90vh] min-w-72 max-w-80 flex-shrink-0 overflow-auto rounded-2xl border border-emerald-100/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "z-[50] -translate-x-full lg:translate-x-0"
      } `}
    >
      <h2
        className="mb-5 text-sm font-bold uppercase tracking-[4.2px] text-emerald-800"
        style={{
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          letterSpacing: "4.2px",
        }}
      >
        Farmer Portal
      </h2>
      <nav className="space-y-2">
        <AccordionItem
          viewName="orders"
          label="My Orders"
          icon={getIcon("orders")}
          filters={orderFilters}
          activeView={activeView}
          setActiveView={setActiveView}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          openAccordion={openAccordion}
          setOpenAccordion={setOpenAccordion}
          closeMobileMenu={() => setIsSidebarOpen(false)}
        />
        <AccordionItem
          viewName="products"
          label="My Products"
          icon={getIcon("products")}
          filters={productFilters}
          activeView={activeView}
          setActiveView={setActiveView}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          openAccordion={openAccordion}
          setOpenAccordion={setOpenAccordion}
          closeMobileMenu={() => setIsSidebarOpen(false)}
        />
        <button
          onClick={handleProfileClick}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-semibold transition-all ${
            activeView === "profile"
              ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-md hover:-translate-y-0.5"
              : "text-emerald-900 hover:bg-emerald-50"
          }`}
        >
          {getIcon("profile")}
          <span>My Profile</span>
        </button>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
