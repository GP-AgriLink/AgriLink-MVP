import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getMyFarmReport } from "../services/farmApi"; // <-- create this API call
import { FiUser } from "react-icons/fi";

const FarmerReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // initialize month/year from either:
  // 1) URL query params (?month=11&year=2025)
  // 2) navigation state (navigate('/farmer/report', { state: { month: 11, year: 2025 } }))
  // 3) fallback to current month/year
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
  // ---------------------------
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

        // Request report for the selected month/year
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

  // ---------------------------
  // Loading UI
  // ---------------------------
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

  // ---------------------------
  // Error UI
  // ---------------------------
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
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
            className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Main Report UI
  // ---------------------------
  return (
    <div className="min-h-screen px-4 py-2 sm:px-8 md:px-12 lg:px-20 xl:px-16 2xl:px-8">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* PAGE HEADER */}
        <div className="mt-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-700">Farmer Report</h1>
            <p className="mt-1 text-sm text-gray-500">
              {reportData?.reportMonth ||
                new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* REPORT CARD */}
        <div className="space-y-8 rounded-2xl border bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="border-b pb-4 text-2xl font-semibold text-gray-800">Sales Overview</h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-lg font-semibold text-gray-600">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="min-w-[150px] rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white px-4 py-2 text-base font-medium text-gray-700 shadow-md transition hover:border-emerald-500 hover:shadow-lg focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-lg font-semibold text-gray-600">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="min-w-[110px] rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white px-4 py-2 text-base font-medium text-gray-700 shadow-md transition hover:border-emerald-500 hover:shadow-lg focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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

              <button
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                <FiUser className="h-4 w-4" />
                My Profile
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-emerald-50 p-6 shadow-md">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="mt-2 text-3xl font-bold text-emerald-700">
                {reportData?.salesOverview?.totalRevenue ?? 0} EGP
              </h3>
            </div>

            <div className="rounded-xl border bg-emerald-50 p-6 shadow-md">
              <p className="text-sm text-gray-500">Orders Completed</p>
              <h3 className="mt-2 text-3xl font-bold text-emerald-700">
                {reportData?.salesOverview?.totalOrdersCompleted ?? 0}
              </h3>
            </div>

            <div className="rounded-xl border bg-emerald-50 p-6 shadow-md">
              <p className="text-sm text-gray-500">Average Order Value</p>
              <h3 className="mt-2 text-3xl font-bold text-emerald-700">
                {reportData?.salesOverview?.averageOrderValue ?? 0} EGP
              </h3>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Best Selling Products</h3>
              {!(reportData?.bestSellingProducts && reportData.bestSellingProducts.length > 0) ? (
                <p className="text-sm text-gray-500">No best selling products for this period.</p>
              ) : (
                <ul className="space-y-3">
                  {(reportData.bestSellingProducts || []).map((p) => (
                    <li
                      key={p._id || p.name}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">Product ID: {p._id}</p>
                      </div>
                      <div className="text-sm font-semibold text-emerald-700">
                        {p.totalQuantitySold ?? 0}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Top Customers</h3>
              {!(reportData?.topCustomers && reportData.topCustomers.length > 0) ? (
                <p className="text-sm text-gray-500">No top customers for this period.</p>
              ) : (
                <ul className="space-y-3">
                  {(reportData.topCustomers || []).map((c, idx) => (
                    <li key={c.userId || idx} className="rounded-lg border bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-700">
                            {c.totalSpent ?? 0} EGP
                          </p>
                          <p className="text-xs text-gray-500">{c.totalOrdersPlaced ?? 0} orders</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerReportPage;
