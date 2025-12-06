import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getMyFarmReport } from "../services/farmApi";
import { DollarSign, ShoppingBag, TrendingUp, Package, Users, Sparkles } from "lucide-react";

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

  // Loading UI with animation
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center" style={{ animation: "fadeInScale 0.4s ease-out" }}>
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  // Error UI
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

  // Render animated empty state for sections
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
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Sales Report
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {reportData?.reportMonth ||
              new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Month/Year Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border-2 border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border-2 border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {(() => {
                const currentYear = new Date().getFullYear();
                const years = [];
                for (let y = currentYear + 1; y >= 2018; y--) years.push(y);
                return years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ));
              })()}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
