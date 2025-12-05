import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getCustomerReport } from "../services/reportApi";
import { DollarSign, ShoppingCart, Heart, Package, TrendingUp } from "lucide-react";

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
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
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

  return (
    <div className="space-y-6 px-4 py-8 sm:px-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-md transition-all hover:shadow-xl">
          <div className="absolute right-4 top-4 rounded-full bg-emerald-100 p-3">
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
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:shadow-xl">
          <div className="absolute right-4 top-4 rounded-full bg-teal-100 p-3">
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
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 shadow-md transition-all hover:shadow-xl sm:col-span-2 lg:col-span-1">
          <div className="absolute right-4 top-4 rounded-full bg-emerald-100 p-3">
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
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-lg">
          <div className="absolute right-6 top-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-4">
            <Heart className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                ⭐ FAVORITE
              </span>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {reportData.favoriteFarm.farmName}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  ${formatCurrency(reportData.favoriteFarm.totalSpent)}
                </p>
              </div>
              <div className="rounded-xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Orders Placed</p>
                <p className="mt-1 text-2xl font-bold text-teal-700">
                  {reportData.favoriteFarm.ordersCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">No favorite farm yet. Keep shopping!</p>
        </div>
      )}

      {/* Top Products */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Top Products</h2>
        </div>

        {!reportData?.topProducts || reportData.topProducts.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No product purchases for this period</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportData.topProducts.map((product, index) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={product.name || index}
                  className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  {index < 3 && (
                    <div className="absolute right-2 top-2 text-2xl">{medals[index]}</div>
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
    </div>
  );
};

export default CustomerReportPage;
