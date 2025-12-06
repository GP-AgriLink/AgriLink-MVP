import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getCustomerReport } from "../services/reportApi";
import { DollarSign, ShoppingCart, Heart, Package, TrendingUp, Sparkles } from "lucide-react";

const CustomerReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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

        const fetched = await getCustomerReport({ year });
        setReportData(fetched);
      } catch (err) {
        console.error("Error fetching customer report:", err);
        setError(err.response?.data?.message || "Failed to load customer report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [navigate, user, year]);

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

  // Render animated empty state
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
            Annual Report
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Year: {reportData?.reportYear ?? year}
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border-2 border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {(() => {
              const current = new Date().getFullYear();
              const years = [];
              for (let y = current; y >= 2018; y--) years.push(y);
              return years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ));
            })()}
          </select>
        </div>
      </div>

      {/* Spending Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
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
              ${formatCurrency(averageOrderValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Farm Card */}
      {reportData?.favoriteFarm ? (
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl"
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
      <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
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
