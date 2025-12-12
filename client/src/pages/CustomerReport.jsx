import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getCustomerReport } from "../services/reportApi";
import { DollarSign, ShoppingCart, Heart, Package, TrendingUp, Sparkles, ChevronDown } from "lucide-react";
import LogoSpinner from "../components/common/LogoSpinner.jsx";

const CustomerReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const currentDate = new Date();
  const [month, setMonth] = useState(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("month");
    return m ? Number(m) : (location.state?.month ?? currentDate.getMonth() + 1);
  });

  const [year, setYear] = useState(() => {
    const params = new URLSearchParams(location.search);
    const y = params.get("year");
    return y ? Number(y) : (location.state?.year ?? currentDate.getFullYear());
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

        const fetched = await getCustomerReport({ month, year });
        setReportData(fetched);
      } catch (err) {
        console.error("Error fetching customer report:", err);
        setError(err.response?.data?.message || "Failed to load customer report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [navigate, user, year, month]);

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
          <p className="mb-2 font-semibold text-red-700">Error Loading Report</p>
          <p className="mb-4 text-sm text-red-600">{error}</p>
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

  const averageOrderValue =
    reportData?.spendingSummary?.totalOrdersPlaced > 0
      ? reportData.spendingSummary.totalSpent / reportData.spendingSummary.totalOrdersPlaced
      : 0;

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
            Monthly Report
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Month and Year Dropdown Selectors */}
        <div className="relative z-50 flex items-center gap-3 rounded-2xl border border-emerald-100/50 bg-white shadow-lg">
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
                    const current = new Date().getFullYear();
                    const years = [];
                    for (let y = current; y >= 2018; y--) years.push(y);
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

      {/* Spending Summary Cards */}
      <div className="relative z-0 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Spent */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
          style={{ animation: "fadeInScale 0.4s ease-out" }}
        >
          <div className="absolute right-4 top-4 rounded-full bg-emerald-100 p-3 transition-transform group-hover:scale-110">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Total Spent</p>
            <p className="text-3xl font-bold text-emerald-700">
              ${formatCurrency(reportData?.spendingSummary?.totalSpent)}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div
          className="group relative z-10 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
          style={{ animation: "fadeInScale 0.5s ease-out" }}
        >
          <div className="absolute right-4 top-4 rounded-full bg-teal-100 p-3 transition-transform group-hover:scale-110">
            <ShoppingCart className="h-6 w-6 text-teal-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Total Orders
            </p>
            <p className="text-3xl font-bold text-teal-700">
              {reportData?.spendingSummary?.totalOrdersPlaced ?? 0}
            </p>
          </div>
        </div>

        {/* Average Order */}
        <div
          className="group z-10 relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl sm:col-span-2 lg:col-span-1"
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
              ${formatCurrency(averageOrderValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Farm Card */}
      {reportData?.favoriteFarm ? (
        <div
          className="relative z-0 overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl"
          style={{ animation: "fadeInScale 0.7s ease-out" }}
        >
          <div className="absolute right-6 top-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-4 transition-transform hover:scale-110">
            <Heart className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="animate-pulse rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                ⭐ FAVORITE
              </span>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {reportData.favoriteFarm.farmName}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/80 p-4 shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  ${formatCurrency(reportData.favoriteFarm.totalSpent)}
                </p>
              </div>
              <div className="rounded-xl bg-white/80 p-4 shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-gray-500">Orders Placed</p>
                <p className="mt-1 text-2xl font-bold text-teal-700">
                  {reportData.favoriteFarm.ordersCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderEmptyState(Heart, "No favorite farm yet. Keep shopping!")
      )}

      {/* Top Products */}
      <div className="animate-fade-in relative z-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Top Products</h2>
        </div>

        {!reportData?.topProducts || reportData.topProducts.length === 0 ? (
          renderEmptyState(Package, "No product purchases for this period")
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportData.topProducts.map((product, index) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={product.name || index}
                  className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm transition-all hover:scale-[1.03] hover:border-emerald-200 hover:shadow-md"
                  style={{ animation: `fadeInScale ${0.3 + index * 0.1}s ease-out` }}
                >
                  {index < 3 && (
                    <div className="absolute right-2 top-2 animate-bounce text-2xl">
                      {medals[index]}
                    </div>
                  )}
                  <div>
                    <p className="mb-2 font-semibold text-gray-900">{product.name}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-emerald-700">
                        {product.totalQuantity ?? product.totalQuantitySold ?? 0}
                      </p>
                      <p className="text-sm text-gray-500">units</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default CustomerReportPage;