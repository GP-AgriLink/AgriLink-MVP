import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getMyFarmReport } from "../services/farmApi";
import { DollarSign, ShoppingBag, TrendingUp, Package, Users, Sparkles, ChevronDown } from "lucide-react";
import LogoSpinner from "../components/common/LogoSpinner.jsx";

const FarmerReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [month, setMonth] = useState(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("month");
    return m ? Number(m) : (location.state?.month ?? new Date().getMonth() + 1);
  });

  const [year, setYear] = useState(() => {
    const params = new URLSearchParams(location.search);
    const y = params.get("year");
    return y ? Number(y) : (location.state?.year ?? new Date().getFullYear());
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token || !user) {
          clearAuthData();
          navigate("/login");
          return;
        }

        if (user.role !== "farmer") {
          navigate("/unauthorized");
          return;
        }

        const fetchedReport = await getMyFarmReport({ month, year });
        setReportData(fetchedReport);
      } catch (err) {
        console.error("Error fetching report:", err);
        const message = err.response?.data?.message || "Failed to load report";
        setError(message);

        if (err.response?.status === 401) {
          clearAuthData();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [navigate, user, month, year]);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <LogoSpinner message="Loading report..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-fade-in max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mb-2 font-semibold text-red-700">Error Loading Report</p>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getRankBadge = (index) => {
    const badges = [
      { bg: "bg-yellow-100", text: "text-yellow-700", icon: "🥇" },
      { bg: "bg-gray-100", text: "text-gray-700", icon: "🥈" },
      { bg: "bg-orange-100", text: "text-orange-700", icon: "🥉" },
    ];
    return badges[index] || { bg: "bg-gray-100", text: "text-gray-700", icon: `#${index + 1}` };
  };

  const renderEmptyState = (icon, message) => (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center p-4"
      style={{ animation: "fadeInScale 0.5s ease-out" }}
    >
      <div className="group relative max-w-sm">
        {/* Gradient border effect */}
        <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40" />

        {/* Content */}
        <div className="relative rounded-2xl bg-white p-6 text-center shadow-lg">
          <div className="relative mb-4">
            {React.createElement(icon, {
              className:
                "mx-auto h-16 w-16 text-gray-300 transition-transform duration-500 group-hover:scale-110",
              style: { animation: "float 3s ease-in-out infinite" },
            })}

            {/* Sparkles */}
            <Sparkles className="absolute left-1/4 top-2 h-4 w-4 animate-pulse text-emerald-400 opacity-60" />
            <Sparkles
              className="absolute right-1/4 top-4 h-3 w-3 animate-pulse text-teal-400 opacity-50"
              style={{ animationDelay: "200ms" }}
            />
          </div>

          <p className="bg-gradient-to-r from-gray-700 to-emerald-600 bg-clip-text text-lg font-semibold text-transparent">
            {message}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 px-4 py-8 sm:px-8">
      {/* Header Section */}
      <div className="relative z-30 animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Sales Report
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Month and Year Dropdown Selectors */}
        <div className="relative flex items-center gap-3 rounded-2xl border border-emerald-100/50 bg-white shadow-lg">
          {/* Month Dropdown */}
          <div className="relative z-50" ref={monthDropdownRef}>
            <button
              onClick={() => {
                setIsMonthDropdownOpen(!isMonthDropdownOpen);
                setIsYearDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-l-2xl px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ][month - 1]}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isMonthDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute right-0 top-full z-[9999] mt-2 w-48 rounded-2xl border border-emerald-100/50 bg-white shadow-2xl">
                <div className="max-h-60 overflow-y-auto py-2">
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMonth(idx + 1);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium transition-all ${month === idx + 1
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200" />

          {/* Year Dropdown */}
          <div className="relative z-50" ref={yearDropdownRef}>
            <button
              onClick={() => {
                setIsYearDropdownOpen(!isYearDropdownOpen);
                setIsMonthDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-r-2xl px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>{year}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute right-0 top-full z-[9999] mt-2 w-32 rounded-2xl border border-emerald-100/50 bg-white shadow-2xl">
                <div className="max-h-60 overflow-y-auto py-2">
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    for (let y = currentYear + 1; y >= 2018; y--) years.push(y);
                    return years.map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setYear(y);
                          setIsYearDropdownOpen(false);
                        }}
                        className={`group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium transition-all ${year === y
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
                          }`}
                      >
                        {y}
                      </button>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="relative z-0 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
          style={{ animation: "fadeInScale 0.4s ease-out" }}
        >
          <div className="absolute right-4 top-4 rounded-full bg-emerald-100 p-3 transition-transform group-hover:scale-110">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Total Revenue
            </p>
            <p className="text-3xl font-bold text-emerald-700">
              ${formatCurrency(reportData?.salesOverview?.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Orders Completed */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
          style={{ animation: "fadeInScale 0.5s ease-out" }}
        >
          <div className="absolute right-4 top-4 rounded-full bg-teal-100 p-3 transition-transform group-hover:scale-110">
            <ShoppingBag className="h-6 w-6 text-teal-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Orders Completed
            </p>
            <p className="text-3xl font-bold text-teal-700">
              {reportData?.salesOverview?.totalOrdersCompleted ?? 0}
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl sm:col-span-2 lg:col-span-1"
          style={{ animation: "fadeInScale 0.6s ease-out" }}
        >
          <div className="absolute right-4 top-4 rounded-full bg-emerald-100 p-3 transition-transform group-hover:scale-110">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Average Order
            </p>
            <p className="text-3xl font-bold text-emerald-700">
              ${formatCurrency(reportData?.salesOverview?.averageOrderValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Best Selling Products & Top Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Best Selling Products */}
        <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Best Selling Products</h2>
          </div>

          {!reportData?.bestSellingProducts || reportData.bestSellingProducts.length === 0 ? (
            renderEmptyState(Package, "No product sales for this period")
          ) : (
            <div className="space-y-3">
              {reportData.bestSellingProducts.map((product, index) => {
                const badge = getRankBadge(index);
                return (
                  <div
                    key={product._id || index}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:scale-[1.02] hover:border-emerald-200 hover:bg-emerald-50/50"
                    style={{ animation: `fadeInScale ${0.3 + index * 0.1}s ease-out` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${badge.bg} text-lg`}
                      >
                        {badge.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Product ID: {product._id?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-700">
                        {product.totalQuantitySold ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">units sold</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-teal-100 p-2">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top Customers</h2>
          </div>

          {!reportData?.topCustomers || reportData.topCustomers.length === 0 ? (
            renderEmptyState(Users, "No customer data for this period")
          ) : (
            <div className="space-y-3">
              {reportData.topCustomers.map((customer, index) => {
                const badge = getRankBadge(index);
                const initials =
                  customer.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?";
                return (
                  <div
                    key={customer.userId || index}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:scale-[1.02] hover:border-teal-200 hover:bg-teal-50/50"
                    style={{ animation: `fadeInScale ${0.3 + index * 0.1}s ease-out` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-md">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{customer.name}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                            >
                              {badge.icon}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-700">
                          ${formatCurrency(customer.totalSpent)}
                        </p>
                        <p className="text-xs text-gray-500">{customer.totalOrdersPlaced} orders</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default FarmerReportPage;