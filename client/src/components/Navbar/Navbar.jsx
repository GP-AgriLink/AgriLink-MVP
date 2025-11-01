
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import avatarPlaceholder from '../../assets/avatar-placeholder.svg';

const ORDER_COUNT_REFRESH_INTERVAL = 600000;

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [incomingOrdersCount, setIncomingOrdersCount] = useState(0);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user) {
        try {
          const { getProfile } = await import('../../services/profileApi');
          const profileData = await getProfile();
          if (profileData?.avatarUrl) {
            setAvatarUrl(profileData.avatarUrl);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      }
    };
    fetchUserAvatar();
  }, [user]);

  useEffect(() => {
    const fetchOrdersCount = async () => {
      if (user) {
        try {
          const { getIncomingOrdersCount } = await import('../../services/orderApi');
          const count = await getIncomingOrdersCount();
          setIncomingOrdersCount(count);
          localStorage.setItem('incomingOrdersCount', count.toString());
        } catch (error) {
          console.error('Error fetching orders count:', error);
          setIncomingOrdersCount(0);
          localStorage.setItem('incomingOrdersCount', '0');
        }
      } else {
        setIncomingOrdersCount(0);
        localStorage.removeItem('incomingOrdersCount');
      }
    };

    if (user) {
      const storedCount = localStorage.getItem('incomingOrdersCount');
      if (storedCount) {
        setIncomingOrdersCount(parseInt(storedCount, 10));
      }
      fetchOrdersCount();
    }
    
    const interval = setInterval(fetchOrdersCount, ORDER_COUNT_REFRESH_INTERVAL);
    
    const handleStorageChange = (e) => {
      if (e.key === 'incomingOrdersCount' && e.newValue) {
        setIncomingOrdersCount(parseInt(e.newValue, 10));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    const loadCartCount = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCartItemsCount(0);
          return;
        }
        
        const cartKey = `cart_${token}`; 
        // ( If cart is generic, change this logic )
        const cartData = localStorage.getItem(cartKey) || localStorage.getItem('cart'); 
        
        if (cartData) {
          const items = JSON.parse(cartData);
          const count = items.reduce((acc, item) => acc + (item.qty || 1), 0);
          setCartItemsCount(count);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartItemsCount(0);
      }
    };

    loadCartCount();

    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith('cart_') || e.key === 'cart')) {
        loadCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', loadCartCount);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', loadCartCount);
    };
  }, [user]);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    
    if (location.pathname === '/dashboard') {
      localStorage.setItem('dashboardActiveView', view);
      window.dispatchEvent(new CustomEvent('dashboardViewChange', { detail: { activeView: view } }));
    } else {
      navigate('/dashboard', { state: { activeView: view } });
    }
  };


  return (
    <header className="font-['Inter'] bg-white/70 backdrop-blur-md sticky top-0 z-[100] border-b border-emerald-100/70 shadow-[0_-4px_16px_rgba(6,78,59,0.7)] rounded-b-2xl">
      <div className="w-full lg:w-5/6 mx-auto flex justify-between items-center px-4 md:px-6 py-4 md:py-5">
        <Logo />

        <div className="hidden lg:flex items-center gap-4">
          
          
          {!user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 font-semibold text-white rounded-xl px-7 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 flex items-center gap-3 border border-white/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-white relative z-10">
                    <path d="M4.5 3.75c5.25.75 9 5.25 9.75 9.75.75-4.5 4.5-9 9.75-9.75-.75 5.25-3.75 9-9.75 11.25 2.25 1.5 5.25 3.75 6 6-4.5-1.5-7.5-3.75-9-6-1.5 2.25-4.5 4.5-9 6 .75-2.25 3.75-4.5 6-6C8.25 12.75 5.25 9 4.5 3.75Z"></path>
                  </svg>
                  <span className="relative z-10">For Farmers</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 stroke-white relative z-10 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100/50 overflow-hidden z-50">
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center gap-3.5 px-5 py-3.5 text-gray-700 font-semibold no-underline hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600 group-hover:stroke-emerald-700 transition-colors">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                      </div>
                      <span className="group-hover:translate-x-0.5 transition-transform">Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center gap-3.5 px-5 py-3.5 text-gray-700 font-semibold no-underline hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all border-t border-emerald-100/50"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center group-hover:from-teal-500/20 group-hover:to-cyan-500/20 transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-teal-600 group-hover:stroke-teal-700 transition-colors">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" y1="8" x2="19" y2="14"></line>
                          <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                      </div>
                      <span className="group-hover:translate-x-0.5 transition-transform">Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigateToDashboard('orders')}
                className="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-sm border border-emerald-300/60 flex items-center justify-center transition-all duration-300 hover:border-emerald-500/80 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:scale-105"
                aria-label="My Orders"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600 group-hover:stroke-emerald-700 transition-colors">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {incomingOrdersCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-emerald-500/60 ring-2 ring-white">
                    {incomingOrdersCount}
                  </span>
                )}
              </button>
              
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="group relative w-11 h-11 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:scale-105"
                  title={`Welcome, ${user.farmName}`}
                  aria-label="Profile Menu"
                >
                  <div className="relative w-full h-full">
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all shadow-lg">
                      <img 
                        src={avatarUrl || avatarPlaceholder} 
                        alt={user.farmName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100/50 overflow-hidden z-50">
                    <div className="px-5 py-4 border-b border-emerald-100/75">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-emerald-200 shadow-md">
                          <img 
                            src={avatarUrl || avatarPlaceholder} 
                            alt={user.farmName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Welcome back</p>
                          <p className="text-base text-gray-900 font-bold truncate">{user.farmName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => handleNavigateToDashboard('products')}
                        className="group flex items-center gap-3.5 px-5 py-3 text-gray-700 font-medium hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-all w-full text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-teal-500/20 group-hover:to-emerald-500/20 transition-all shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-teal-600 group-hover:stroke-teal-700 transition-colors">
                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                        </div>
                        <span className="group-hover:translate-x-0.5 transition-transform">My Products</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigateToDashboard('profile')}
                        className="group flex items-center gap-3.5 px-5 py-3 text-gray-700 font-medium hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all w-full text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-cyan-600 group-hover:stroke-cyan-700 transition-colors">
                            <circle cx="12" cy="8" r="5"></circle>
                            <path d="M20 21a8 8 0 0 0-16 0"></path>
                          </svg>
                        </div>
                        <span className="group-hover:translate-x-0.5 transition-transform">My Profile</span>
                      </button>
                      
                      <Link
                        to="/edit-profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="group flex items-center gap-3.5 px-5 py-3 text-gray-700 font-medium no-underline hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-indigo-600 group-hover:stroke-indigo-700 transition-colors">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </div>
                        <span className="group-hover:translate-x-0.5 transition-transform">Edit Profile</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="group relative w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm border border-slate-200/70 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:border-emerald-400/80 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-105"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-600 group-hover:stroke-white transition-colors">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          )}

          <Link
            to="/cart"
            className="group relative w-11 h-11 rounded-xl bg-white/80 backdrop-blur-sm border border-emerald-200/60 flex items-center justify-center transition-all duration-300 hover:border-emerald-400/80 hover:bg-emerald-50/50 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5 hover:scale-105"
            aria-label="Shopping Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600 group-hover:stroke-emerald-700 transition-colors">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-emerald-500/60 ring-2 ring-white">
                {cartItemsCount}
              </span>
            )}
          </Link>

        </div>

        <button
          ref={hamburgerButtonRef}
          onClick={toggleMobileMenu}
          className="lg:hidden w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
          aria-label="Toggle Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`stroke-white transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
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
        <div ref={mobileMenuRef} className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-emerald-100/50 shadow-2xl">
          <div className="px-4 py-5 space-y-2.5">
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-gray-700 font-semibold no-underline hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <span>Shopping Cart</span>
              </div>
              {cartItemsCount > 0 && (
                <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-500/50">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-gray-700 font-semibold no-underline hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600">
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
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 text-gray-700 font-semibold no-underline hover:from-teal-100 hover:to-cyan-100 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-teal-600">
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
                <div className="flex items-center gap-3.5 px-4 py-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-sm border border-emerald-100/50">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-emerald-200 shadow-md">
                      <img 
                        src={avatarUrl || avatarPlaceholder} 
                        alt={user.farmName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Welcome back</p>
                    <p className="text-base text-gray-900 font-bold truncate">{user.farmName}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigateToDashboard('orders')}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-gray-700 font-semibold hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                    <span>My Orders</span>
                  </div>
                  {incomingOrdersCount > 0 && (
                    <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-500/50">
                      {incomingOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavigateToDashboard('products')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 text-gray-700 font-semibold hover:from-teal-100 hover:to-emerald-100 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-teal-600">
                      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <span>My Products</span>
                </button>

                <button
                  onClick={() => handleNavigateToDashboard('profile')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 text-gray-700 font-semibold hover:from-cyan-100 hover:to-blue-100 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-cyan-600">
                      <circle cx="12" cy="8" r="5"></circle>
                      <path d="M20 21a8 8 0 0 0-16 0"></path>
                    </svg>
                  </div>
                  <span>My Profile</span>
                </button>

                <Link
                  to="/edit-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-700 font-semibold no-underline hover:from-indigo-100 hover:to-purple-100 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-indigo-600">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <span>Edit Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 font-semibold hover:bg-gradient-to-r hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-600 hover:text-white transition-all shadow-sm group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 group-hover:bg-white/20 flex items-center justify-center shadow-sm transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-600 group-hover:stroke-white transition-colors">
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
  )
}

export default Navbar;