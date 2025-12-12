import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Logo from "../common/Logo";
import avatarPlaceholder from "/avatar-placeholder.svg";
import { LogIn, UserPlus } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  const userAvatar = user?.avatarUrl || avatarPlaceholder;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Near Me", path: "/#DiscoverSection", isScroll: true },
    { name: "About Us", path: "/about-us" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  const handleNavClick = (e, link) => {
    setIsMobileMenuOpen(false);
    if (link.isScroll) {
      e.preventDefault();
      if (location.pathname === "/") {
        const sectionId = link.path.split("#")[1];
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(link.path);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(event.target)
      ) {
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
    setIsMobileMenuOpen(false);
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
    navigate(`/dashboard/${view}`);
  };

  const UserMenuItems = () => (
    <>
      <div className="border-b border-emerald-100/75 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full shadow-md ring-2 ring-emerald-200">
            <img src={userAvatar} alt={user.email} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Welcome back</p>
            <p className="truncate text-base font-bold text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="py-2">
        <button onClick={() => handleNavigateToDashboard("orders")} className="group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-sm transition-all group-hover:from-emerald-500/20 group-hover:to-teal-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600 transition-colors group-hover:stroke-emerald-700"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <span className="transition-transform group-hover:translate-x-0.5">My Orders</span>
        </button>

        {user?.role === "farmer" && (
          <button onClick={() => handleNavigateToDashboard("products")} className="group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 shadow-sm transition-all group-hover:from-teal-500/20 group-hover:to-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-teal-600 transition-colors group-hover:stroke-teal-700"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <span className="transition-transform group-hover:translate-x-0.5">My Products</span>
          </button>
        )}

        <button onClick={() => handleNavigateToDashboard("profile")} className="group flex w-full items-center gap-3.5 px-5 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-sm transition-all group-hover:from-cyan-500/20 group-hover:to-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-cyan-600 transition-colors group-hover:stroke-cyan-700"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
          </div>
          <span className="transition-transform group-hover:translate-x-0.5">My Profile</span>
        </button>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-[100] rounded-b-3xl border-b border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 font-['Inter'] shadow-[0_-4px_16px_rgba(6,78,59,0.7)] backdrop-blur-lg">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-4 md:px-6 md:py-5 lg:w-5/6">

        {/* --- LEFT: Logo --- */}
        <div className="flex flex-1 items-center justify-start">
          <Logo className="hidden lg:flex" />
          <Logo
            iconOnly={true}
            iconContainerClass="w-12 h-12"
            className="overflow-hidden rounded-full lg:hidden"
          />
        </div>

        {/* --- CENTER: Desktop Navigation --- */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`text-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:text-emerald-600 ${
                location.pathname === link.path && !link.isScroll
                  ? "font-bold text-emerald-600"
                  : "text-slate-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* --- RIGHT: Actions --- */}
        <div className="flex flex-1 items-center justify-end gap-4">

          {/* ============================
              DESKTOP ACTIONS
          ================================ */}
          <div className="hidden items-center gap-4 lg:flex">
            {user?.role === "customer" && (
              <Link to="/cart" className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-emerald-400/80 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:shadow-xl hover:shadow-emerald-500/40" aria-label="Shopping Cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-600 transition-colors group-hover:stroke-white">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/60 ring-2 ring-white">{cartCount}</span>}
              </Link>
            )}

            {!user ? (
              <>
                <Link to="/login" className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 px-7 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  <LogIn className="relative z-10 h-5 w-5" /><span className="relative z-10">Login</span>
                </Link>
                <Link to="/register" className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 px-7 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  <UserPlus className="relative z-10 h-5 w-5" /><span className="relative z-10">Sign Up</span>
                </Link>
              </>
            ) : (
              <>
                <div className="relative" ref={profileDropdownRef}>
                  <button onClick={toggleProfileDropdown} className="group relative h-11 w-11 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30" title={`Welcome, ${user.email}`}>
                    <div className="relative h-full w-full">
                      <div className="h-12 w-12 overflow-hidden rounded-full shadow-lg ring-2 ring-emerald-500/30 transition-all group-hover:ring-emerald-500/60">
                        <img src={userAvatar} alt={user.email} className="h-full w-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-sm ring-2 ring-white"></div>
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-emerald-100/50 bg-white shadow-2xl backdrop-blur-xl">
                      <UserMenuItems />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-red-600/60 hover:bg-red-50 hover:shadow-xl hover:shadow-red-500/30"
                  aria-label="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-red-600 transition-colors group-hover:stroke-red-700">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* =========================
              2. MOBILE ACTIONS 
          ============================= */}
          <div className="flex items-center gap-3 lg:hidden">
            {user?.role === "customer" && (
              <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-600 transition-colors group-hover:stroke-emerald-600">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg shadow-red-500/60 ring-1 ring-white">{cartCount}</span>}
              </Link>
            )}

            {user && (
              <div className="relative" ref={mobileProfileRef}>
                <button onClick={toggleProfileDropdown} className="group relative h-11 w-11 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30">
                  <div className="relative h-full w-full">
                    <div className="h-11 w-11 overflow-hidden rounded-full shadow-lg ring-2 ring-emerald-500/30 transition-all group-hover:ring-emerald-500/60">
                      <img src={userAvatar} alt={user.email} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-sm ring-1 ring-white"></div>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="fixed left-0 right-0 top-[80px] z-50 w-full border-t border-emerald-100/50 bg-white shadow-2xl backdrop-blur-xl md:top-[88px]">
                    <UserMenuItems />
                  </div>
                )}
              </div>
            )}

            <button
              ref={hamburgerButtonRef}
              onClick={toggleMobileMenu}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
              aria-label="Toggle Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`stroke-white transition-transform duration-300 ${isMobileMenuOpen ? "rotate-90" : ""}`}>
                {isMobileMenuOpen ? (<><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>) : (<><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>)}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-emerald-100/50 shadow-2xl lg:hidden flex flex-col max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col p-4 space-y-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={(e) => handleNavClick(e, link)} className={`block rounded-xl px-5 py-4 text-base font-semibold transition-all ${location.pathname === link.path && !link.isScroll ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-l-4 border-emerald-500 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600 border-l-4 border-transparent"}`}>
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <div className="space-y-3 pt-2">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-4 font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]"><span>Login</span></Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-4 font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/40 active:scale-[0.98]"><span>Sign Up</span></Link>
                </>
              ) : (
                <button onClick={handleLogout} className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-base font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;