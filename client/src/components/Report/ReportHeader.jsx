import React from "react";
import { ChevronDown } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ReportHeader = ({
  title,
  month,
  year,
  onMonthChange,
  onYearChange,
  isMonthDropdownOpen,
  isYearDropdownOpen,
  setIsMonthDropdownOpen,
  setIsYearDropdownOpen,
  monthDropdownRef,
  yearDropdownRef,
}) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + 1; y >= 2018; y--) years.push(y);

  return (
    <>
      <div className="relative z-30 animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {title}
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
            <span>{MONTHS[month - 1]}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isMonthDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isMonthDropdownOpen && (
            <div className="absolute right-0 top-full z-[9999] mt-2 w-48 rounded-2xl border border-emerald-100/50 bg-white shadow-2xl">
              <div className="max-h-60 overflow-y-auto py-2">
                {MONTHS.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onMonthChange(idx + 1);
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium transition-all ${
                      month === idx + 1
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
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      onYearChange(y);
                      setIsYearDropdownOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium transition-all ${
                      year === y
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ReportHeader;
