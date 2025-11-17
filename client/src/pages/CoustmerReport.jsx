import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getCustomerReport } from "../services/reportApi";
import { FiUser } from "react-icons/fi";

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

        // customers should be allowed; request report by year

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

  if (loading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-600">Loading report...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="mb-2 font-semibold text-red-700">Error Loading Report</p>
          <p className="mb-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-4 py-2 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-700">Customer Report</h1>
          <p className="mt-1 text-sm text-gray-500">Year: {reportData?.reportYear ?? year}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Spending Summary</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="min-w-[110px] rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md transition hover:border-emerald-500 hover:shadow-lg focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
              >
                <FiUser className="h-4 w-4" />
                My Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-emerald-50 p-4">
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {reportData?.spendingSummary?.totalSpent ?? 0} EGP
              </p>
            </div>
            <div className="rounded-lg border bg-emerald-50 p-4">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {reportData?.spendingSummary?.totalOrdersPlaced ?? 0}
              </p>
            </div>
            <div className="rounded-lg border bg-emerald-50 p-4">
              <p className="text-xs text-gray-500">Favorite Farm</p>
              <p className="mt-1 text-lg font-semibold text-gray-800">
                {reportData?.favoriteFarm?.farmName ?? "—"}
              </p>
              <p className="text-sm text-gray-500">
                Spent: {reportData?.favoriteFarm?.totalSpent ?? 0} EGP • Orders:{" "}
                {reportData?.favoriteFarm?.ordersCount ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Top Products</h3>
            {!(reportData?.topProducts && reportData.topProducts.length > 0) ? (
              <p className="text-sm text-gray-500">No top products for this period.</p>
            ) : (
              <ul className="space-y-2">
                {(reportData.topProducts || []).map((p, idx) => (
                  <li
                    key={p.name || idx}
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        Quantity: {p.totalQuantity ?? p.totalQuantitySold ?? 0}
                      </p>
                    </div>
                    <div className="font-semibold text-emerald-700">
                      {p.totalQuantity ?? p.totalQuantitySold ?? 0}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReportPage;
