import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, clearAuthData, useAuth } from "../context/AuthContext";
import { getMyFarmReport } from "../services/farmApi";
import { generateFarmReportAnalysis } from "../services/aiService";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Brain,
  BarChart3,
  Sparkles,
  ChevronDown,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import LogoSpinner from "../components/common/LogoSpinner.jsx";
import ReportHeader from "../components/Report/ReportHeader.jsx";
import StatsCard from "../components/Report/StatsCard.jsx";
import AIAnalysis from "../components/Report/AIAnalysis.jsx";
import BestSellingProducts from "../components/Report/BestSellingProducts.jsx";
import TopCustomers from "../components/Report/TopCustomers.jsx";

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

  // AI Analysis state - Store multiple cached results
  const [cachedAnalyses, setCachedAnalyses] = useState({}); // { 'EN-summary': { data, timestamp }, 'AR-detailed': { data, timestamp } }
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [viewMode, setViewMode] = useState("report"); // 'report', 'ai-summary', or 'ai-detailed'
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [currentCacheKey, setCurrentCacheKey] = useState("EN-summary");
  const languageDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
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

  const handleGenerateAIAnalysis = async (isDetailed = false, language = "EN") => {
    // Close language dropdown if open
    setIsLanguageDropdownOpen(false);

    // Cache key includes language and detail level for separate caching
    const cacheKey = `${language}-${isDetailed ? "detailed" : "summary"}`;
    const now = Date.now();
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

    // Check if we have this specific report cached
    const cached = cachedAnalyses[cacheKey];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      // Use cached analysis - instant load
      setCurrentAnalysis(cached.data);
      setCurrentCacheKey(cacheKey);
      setShowAiAnalysis(true);
      setViewMode(isDetailed ? "ai-detailed" : "ai-summary");
      return;
    }

    // Show loading state with transition
    setAiLoading(true);
    setAiError(null);
    const targetView = isDetailed ? "ai-detailed" : "ai-summary";
    setViewMode(targetView); // Switch to AI view immediately to show loading

    try {
      const analysis = await generateFarmReportAnalysis(month, year, language, isDetailed);

      // Cache the analysis with timestamp
      setCachedAnalyses((prev) => ({
        ...prev,
        [cacheKey]: {
          data: analysis,
          timestamp: Date.now(),
          language,
          isDetailed,
        },
      }));

      setCurrentAnalysis(analysis);
      setCurrentCacheKey(cacheKey);
      setShowAiAnalysis(true);
      toast.success(`${isDetailed ? "Detailed" : "Summary"} AI analysis generated successfully!`, {
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Error generating AI analysis:", err);
      setAiError(err.message || "Failed to generate AI analysis");
      toast.error(err.message || "Failed to generate AI analysis. Please try again.", {
        autoClose: 4000,
      });
      // Keep the view mode - don't switch back to report
    } finally {
      setAiLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "report") {
      setViewMode("report");
      setShowAiAnalysis(false);
      setAiError(null);
    } else if (tab === "ai-summary") {
      // Switching to AI Summary
      const summaryKey = `${selectedLanguage}-summary`;
      const cached = cachedAnalyses[summaryKey];
      const now = Date.now();
      const CACHE_DURATION = 30 * 60 * 1000;

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        // Use cached summary
        setCurrentAnalysis(cached.data);
        setCurrentCacheKey(summaryKey);
        setViewMode("ai-summary");
        setShowAiAnalysis(true);
        setAiError(null);
      } else {
        // Generate new summary
        handleGenerateAIAnalysis(false, selectedLanguage);
      }
    } else if (tab === "ai-detailed") {
      // Toggle language selection dropdown for detailed report
      setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    }
  };

  // Clear cache when month/year changes
  useEffect(() => {
    setCachedAnalyses({}); // Clear all cached analyses
    setCurrentAnalysis(null);
    setShowAiAnalysis(false);
    setViewMode("report");
  }, [month, year]);

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

  return (
    <div className="space-y-6 px-4 py-8 sm:px-8">
      {/* Header Section */}
      <ReportHeader
        title="Sales Report"
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
          title="Total Revenue"
          value={`$${formatCurrency(reportData?.salesOverview?.totalRevenue)}`}
          gradient="bg-gradient-to-br from-emerald-50 via-white to-teal-50"
          iconGradient="bg-emerald-100"
          delay={0.4}
        />
        <StatsCard
          icon={ShoppingBag}
          title="Orders Completed"
          value={reportData?.salesOverview?.totalOrdersCompleted ?? 0}
          gradient="bg-gradient-to-br from-teal-50 via-white to-emerald-50"
          iconGradient="bg-teal-100"
          delay={0.5}
        />
        <StatsCard
          icon={TrendingUp}
          title="Average Order"
          value={`$${formatCurrency(reportData?.salesOverview?.averageOrderValue)}`}
          gradient="bg-gradient-to-br from-emerald-50 via-white to-emerald-50"
          iconGradient="bg-emerald-100"
          delay={0.6}
        />
      </div>

      {/* Premium Three-Tab Navigation */}
      <div className="relative z-20">
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100/50 bg-white p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          {/* Tab Buttons - Three Tabs */}
          <div className="flex flex-1 gap-2">
            {/* Sales Report Tab */}
            <button
              onClick={() => handleTabClick("report")}
              className={`group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                viewMode === "report"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="hidden sm:inline">Sales Report</span>
              <span className="sm:hidden">Sales</span>
              {viewMode === "report" && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 transition-opacity group-hover:opacity-10" />
              )}
            </button>

            {/* AI Summary Tab */}
            <button
              onClick={() => handleTabClick("ai-summary")}
              className={`group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                viewMode === "ai-summary"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <Brain className="h-5 w-5" />
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline">AI Insights</span>
                <span className="sm:hidden">AI</span>
                {(() => {
                  const summaryKey = `${selectedLanguage}-summary`;
                  const isCached =
                    cachedAnalyses[summaryKey] &&
                    Date.now() - cachedAnalyses[summaryKey].timestamp < 30 * 60 * 1000;
                  return isCached && viewMode !== "ai-summary" ? (
                    <span className="flex h-2 w-2">
                      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-600 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                    </span>
                  ) : null;
                })()}
              </span>
              {viewMode === "ai-summary" && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 transition-opacity group-hover:opacity-10" />
              )}
            </button>

            {/* Detailed AI Report Tab with Language Dropdown */}
            <div className="relative flex-1" ref={languageDropdownRef}>
              <button
                onClick={() => handleTabClick("ai-detailed")}
                className={`group relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                  viewMode === "ai-detailed"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <Sparkles className="h-5 w-5" />
                <span className="flex items-center gap-2">
                  <span className="hidden sm:inline">Detailed Report</span>
                  <span className="sm:hidden">Detailed</span>
                  {(() => {
                    const CACHE_DURATION = 30 * 60 * 1000;
                    const now = Date.now();
                    const cachedCount = Object.values(cachedAnalyses).filter(
                      (cache) => cache.isDetailed && now - cache.timestamp < CACHE_DURATION
                    ).length;
                    return cachedCount > 0 && viewMode !== "ai-detailed" ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-600">
                        {cachedCount}
                      </span>
                    ) : null;
                  })()}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
                />
                {viewMode === "ai-detailed" && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 transition-opacity group-hover:opacity-10" />
                )}
              </button>

              {/* Language Dropdown */}
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 top-full z-[9999] mt-2 w-32 rounded-2xl border border-emerald-100/50 bg-white shadow-2xl">
                  <div className="max-h-60 overflow-y-auto py-2">
                    {[
                      { code: "AR", label: "AR", flag: "🇪🇬" },
                      { code: "EN", label: "EN", flag: "🇬🇧" },
                    ].map((lang) => {
                      const detailedKey = `${lang.code}-detailed`;
                      const isCached =
                        cachedAnalyses[detailedKey] &&
                        Date.now() - cachedAnalyses[detailedKey].timestamp < 30 * 60 * 1000;

                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            setIsLanguageDropdownOpen(false);
                            handleGenerateAIAnalysis(true, lang.code);
                          }}
                          className={`group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium transition-all ${
                            selectedLanguage === lang.code
                              ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700"
                              : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                          {isCached && (
                            <span className="ml-auto flex items-center gap-1">
                              <svg
                                className="h-3 w-3 text-emerald-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with Smooth Transitions */}
      <div className="animate-fadeIn">
        {viewMode === "ai-summary" || viewMode === "ai-detailed" ? (
          aiLoading ? (
            // Skeleton Loading for AI Analysis
            <div className="animate-pulse space-y-6">
              {/* Summary Skeleton */}
              <div className="rounded-2xl border border-emerald-100/50 bg-white p-6 shadow-lg">
                <div className="mb-4 h-6 w-32 rounded bg-emerald-100"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-gray-200"></div>
                  <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                  <div className="h-4 w-4/6 rounded bg-gray-200"></div>
                </div>
              </div>

              {/* Predictions Skeleton */}
              <div className="rounded-2xl border border-emerald-100/50 bg-white p-6 shadow-lg">
                <div className="mb-4 h-6 w-40 rounded bg-emerald-100"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-6 w-6 flex-shrink-0 rounded-full bg-emerald-100"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full rounded bg-gray-200"></div>
                        <div className="h-4 w-4/5 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions Skeleton */}
              <div className="rounded-2xl border border-emerald-100/50 bg-white p-6 shadow-lg">
                <div className="mb-4 h-6 w-36 rounded bg-emerald-100"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-6 w-6 flex-shrink-0 rounded-full bg-teal-100"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full rounded bg-gray-200"></div>
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <AIAnalysis
                aiAnalysis={currentAnalysis}
                aiLoading={aiLoading}
                aiError={aiError}
                showAiAnalysis={showAiAnalysis}
                onGenerate={handleGenerateAIAnalysis}
                onToggle={() => handleTabClick("report")}
              />
            </div>
          )
        ) : (
          <div className="grid animate-fadeIn gap-6 lg:grid-cols-2">
            <BestSellingProducts
              products={reportData?.bestSellingProducts}
              formatCurrency={formatCurrency}
            />
            <TopCustomers customers={reportData?.topCustomers} formatCurrency={formatCurrency} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerReportPage;
