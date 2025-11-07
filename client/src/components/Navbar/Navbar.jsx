import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext"; // Import useCart for instant updates
import Logo from "../common/Logo";
import avatarPlaceholder from "../../assets/avatar-placeholder.svg";

const ORDER_COUNT_REFRESH_INTERVAL = 600000; // 10 minutes

function Navbar() {
  // Get user, logout, order count, and avatar from AuthContext
  const { user, logout, incomingOrdersCount, fetchAndSetOrderCount, avatarUrl } = useAuth();
  const { cartCount } = useCart(); // Get cart count directly from context
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // This interval still runs to catch new orders from other sources
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchAndSetOrderCount(); // Use context function
      }, ORDER_COUNT_REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [user, fetchAndSetOrderCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigateToDashboard = (view) => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/dashboard", { state: { activeView: view } });
  };

  // This logic is now cleaner, as both counts come from contexts
  const totalCount = user ? incomingOrdersCount : cartCount;

  return (
    <header className="sticky top-0 z-[100] rounded-b-2xl border-b border-emerald-100/70 bg-white/70 font-['Inter'] shadow-[0_-4px_16px_rgba(6,78,59,0.7)] backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-4 md:px-6 md:py-5 lg:w-5/6">
        {/* Responsive Logo: Full on desktop, icon-only on mobile */}
        <Logo className="hidden lg:flex" />
        <Logo iconOnly={true} iconContainerClass="w-12 h-12" className="lg:hidden" />

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/cart"
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-emerald-400/80 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:shadow-xl hover:shadow-emerald-500/40"
            aria-label="Shopping Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-slate-600 transition-colors group-hover:stroke-white"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {/* This now uses the instant cartCount from useCart */}
            {/* {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-emerald-500/60 ring-2 ring-white">
                {cartCount}
              </span>
            )} */}
          </Link>
          {!user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 px-7 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 stroke-white"
                  >
                    <path d="M4.5 3.75c5.25.75 9 5.25 9.75 9.75.75-4.5 4.5-9 9.75-9.75-.75 5.25-3.75 9-9.75 11.25 2.25 1.5 5.25 3.75 6 6-4.5-1.5-7.5-3.75-9-6-1.5 2.25-4.5 4.5-9 6 .75-2.25 3.75-4.5 6-6C8.25 12.75 5.25 9 4.5 3.75Z"></path>
                  </svg>
                  <span className="relative z-10">For Farmers</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`relative z-10 stroke-white transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-emerald-100/50 bg-white shadow-2xl backdrop-blur-xl">
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center gap-3.5 px-5 py-3.5 font-semibold text-gray-700 no-underline transition-all hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-sm transition-all group-hover:from-emerald-500/20 group-hover:to-teal-500/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="stroke-emerald-600 transition-colors group-hover:stroke-emerald-700"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                      </div>
                      <span className="transition-transform group-hover:translate-x-0.5">
                        Login
                      </span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center gap-3.5 border-t border-emerald-100/50 px-5 py-3.5 font-semibold text-gray-700 no-underline transition-all hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 shadow-sm transition-all group-hover:from-teal-500/20 group-hover:to-cyan-500/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="stroke-teal-600 transition-colors group-hover:stroke-teal-700"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" y1="8" x2="19" y2="14"></line>
                          <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                      </div>
                      <span className="transition-transform group-hover:translate-x-0.5">
                        Sign Up
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigateToDashboard("orders")}
                className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-emerald-400/80 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:shadow-xl hover:shadow-emerald-500/40"
                aria-label="My Orders"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-slate-600 transition-colors group-hover:stroke-white"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {/* Display count from CONTEXT state */
                /* {incomingOrdersCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-emerald-500/60 ring-2 ring-white">
                      {incomingOrdersCount}
                    </span>
                  )} */}
              </button>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="group relative h-11 w-11 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
                  title={`Welcome, ${user.farmName}`}
                  aria-label="Profile Menu"
                >
                  <div className="relative h-full w-full">
                    <div className="h-12 w-12 overflow-hidden rounded-full shadow-lg ring-2 ring-emerald-500/30 transition-all group-hover:ring-emerald-500/60">
                      <img
                        src={avatarUrl || avatarPlaceholder}
                        alt={user.farmName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-sm ring-2 ring-white"></div>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-emerald-100/50 bg-white shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-emerald-100/75 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-full shadow-md ring-2 ring-emerald-200">
                          <img
                            src={avatarUrl || avatarPlaceholder}
                            alt={user.farmName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Welcome back
                          </p>
                          <p className="truncate text-base font-bold text-gray-900">
                            {user.farmName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => handleNavigateToDashboard("products")}
                        className="group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 shadow-sm transition-all group-hover:from-teal-500/20 group-hover:to-emerald-500/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-teal-600 transition-colors group-hover:stroke-teal-700"
                          >
                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                        </div>
                        <span className="transition-transform group-hover:translate-x-0.5">
                          My Products
                        </span>
                      </button>

                      <button
                        onClick={() => handleNavigateToDashboard("profile")}
                        className="group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-sm transition-all group-hover:from-cyan-500/20 group-hover:to-blue-500/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-cyan-600 transition-colors group-hover:stroke-cyan-700"
                          >
                            <circle cx="12" cy="8" r="5"></circle>
                            <path d="M20 21a8 8 0 0 0-16 0"></path>
                          </svg>
                        </div>
                        <span className="transition-transform group-hover:translate-x-0.5">
                          My Profile
                        </span>
                      </button>

                      <Link
                        to="/edit-profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="group flex items-center gap-3.5 px-5 py-3 font-medium text-gray-700 no-underline transition-all hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-sm transition-all group-hover:from-indigo-500/20 group-hover:to-purple-500/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-indigo-600 transition-colors group-hover:stroke-indigo-700"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </div>
                        <span className="transition-transform group-hover:translate-x-0.5">
                          Edit Profile
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-emerald-400/80 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:shadow-xl hover:shadow-emerald-500/40"
                aria-label="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-slate-600 transition-colors group-hover:stroke-white"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          )}
        </div>

        <button
          ref={hamburgerButtonRef}
          onClick={toggleMobileMenu}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 lg:hidden"
          aria-label="Toggle Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`stroke-white transition-transform duration-300 ${
              isMobileMenuOpen ? "rotate-90" : ""
            }`}
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="bg-white/98 max-h-[calc(100vh-60px)] overflow-y-auto border-t border-emerald-100/50 shadow-lg backdrop-blur-md lg:hidden"
        >
          <div className="space-y-2.5 px-4 py-5">
            {!user ? (
              <>
                <Link
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:from-emerald-100 hover:to-teal-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-emerald-600"
                      >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </div>
                    <span>Shopping Cart</span>
                  </div>
                  {/* This now uses the instant cartCount from useCart */}
                  {/* {cartCount > 0 && (
                    <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-500/50">
                      {cartCount}
                    </span>
                  )} */}
                </Link>

                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3.5 font-semibold text-gray-700 no-underline shadow-sm transition-all hover:from-emerald-100 hover:to-teal-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-emerald-600"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                  </div>
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3.5 font-semibold text-gray-700 no-underline shadow-sm transition-all hover:from-teal-100 hover:to-cyan-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-teal-600"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <line x1="19" y1="8" x2="19" y2="14"></line>
                      <line x1="22" y1="11" x2="16" y2="11"></line>
                    </svg>
                  </div>
                  <span>Sign Up</span>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3.5 rounded-xl border border-emerald-100/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 py-4 shadow-sm">
                  <div className="relative">
                    <div className="h-14 w-14 overflow-hidden rounded-xl shadow-md ring-2 ring-emerald-200">
                      <img
                        src={avatarUrl || avatarPlaceholder}
                        alt={user.farmName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-sm ring-2 ring-white"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Welcome back
                    </p>
                    <p className="truncate text-base font-bold text-gray-900">{user.farmName}</p>
                  </div>
                </div>

                <Link
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:from-emerald-100 hover:to-teal-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-emerald-600"
                      >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </div>
                    <span>Shopping Cart</span>
                  </div>
                  {/* This now uses the instant cartCount from useCart */}
                  {/* {cartCount > 0 && (
                    <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-500/50">
                      {cartCount}
                    </span>
                  )} */}
                </Link>
                <button
                  onClick={() => handleNavigateToDashboard("orders")}
                  className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:from-emerald-100 hover:to-teal-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-emerald-600"
                      >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                    <span>My Orders</span>
                  </div>
                  {/* {incomingOrdersCount > 0 && (
                    <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-500/50">
                      {incomingOrdersCount}
                    </span>
                  )} */}
                </button>

                <button
                  onClick={() => handleNavigateToDashboard("products")}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:from-teal-100 hover:to-emerald-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-teal-600"
                    >
                      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <span>My Products</span>
                </button>

                <button
                  onClick={() => handleNavigateToDashboard("profile")}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:from-cyan-100 hover:to-blue-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-cyan-600"
                    >
                      <circle cx="12" cy="8" r="5"></circle>
                      <path d="M20 21a8 8 0 0 0-16 0"></path>
                    </svg>
                  </div>
                  <span>My Profile</span>
                </button>

                <Link
                  to="/edit-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3.5 font-semibold text-gray-700 no-underline shadow-sm transition-all hover:from-indigo-100 hover:to-purple-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-indigo-600"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <span>Edit Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-3.5 font-semibold text-slate-700 shadow-sm transition-all hover:bg-gradient-to-r hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:text-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 shadow-sm transition-all group-hover:bg-white/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-slate-600 transition-colors group-hover:stroke-white"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </div>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
