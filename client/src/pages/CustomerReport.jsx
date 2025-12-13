import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getCustomerReport } from "../services/reportApi";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import LogoSpinner from "../components/common/LogoSpinner.jsx";
import ReportHeader from "../components/Report/ReportHeader.jsx";
import StatsCard from "../components/Report/StatsCard.jsx";
import FavoriteProducts from "../components/Report/FavoriteProducts.jsx";

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

  return (
    <div className="space-y-6 px-4 py-8 sm:px-8">
      {/* Header Section */}
      <ReportHeader
        title="Purchase Report"
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        isMonthDropdownOpen={isMonthDropdownOpen}
        isYearDropdownOpen={isYearDropdownOpen}
        setIsMonthDropdownOpen={setIsMonthDropdownOpen}
        setIsYearDropdownOpen={setIsYearDropdownOpen}
        monthDropdownRef={monthDropdownRef}
        yearDropdownRef={yearDropdownRef}
      />

      {/* Stats Overview Cards */}
      <div className="relative z-0 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={DollarSign}
          title="Total Spent"
          value={`$${formatCurrency(reportData?.totalSpent)}`}
          gradient="bg-gradient-to-br from-emerald-50 via-white to-teal-50"
          iconGradient="bg-emerald-100"
          delay={0.4}
        />
        <StatsCard
          icon={ShoppingCart}
          title="Orders Placed"
          value={reportData?.totalOrdersPlaced ?? 0}
          gradient="bg-gradient-to-br from-teal-50 via-white to-emerald-50"
          iconGradient="bg-teal-100"
          delay={0.5}
        />
        <StatsCard
          icon={TrendingUp}
          title="Average Order"
          value={`$${formatCurrency(reportData?.averageOrderValue)}`}
          gradient="bg-gradient-to-br from-emerald-50 via-white to-emerald-50"
          iconGradient="bg-emerald-100"
          delay={0.6}
        />
      </div>

      {/* Favorite Products */}
      <FavoriteProducts products={reportData?.favoriteProducts} />
    </div>
  );
};

export default CustomerReportPage;
