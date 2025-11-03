
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; 
import Logo from '../common/Logo';
import avatarPlaceholder from '../../assets/avatar-placeholder.svg';

const ORDER_COUNT_REFRESH_INTERVAL = 600000;

function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart(); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [incomingOrdersCount, setIncomingOrdersCount] = useState(0);
  
  // --- 3. حذف الـ useState بتاع cartItemsCount ---

  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // ... (useEffect بتاع fetchUserAvatar زي ما هو) ...
  // ... (useEffect بتاع fetchOrdersCount زي ما هو) ...

  // --- 4. حذف الـ useEffect بتاع loadCartCount بالكامل ---
  // (مبقناش محتاجينه، المخزن بيعمل كل ده)

  // ... (useEffect بتاع handleClickOutside زي ما هو) ...
  // ... (باقي الدوال زي ما هي) ...
  
  return (
    <header className="font-['Inter'] bg-white/70 backdrop-blur-md sticky top-0 z-[100] border-b border-emerald-100/70 shadow-[0_-4px_16px_rgba(6,78,59,0.7)] rounded-b-2xl">
      <div className="w-full lg:w-5/6 mx-auto flex justify-between items-center px-4 md:px-6 py-4 md:py-5">
        <Logo />

        <div className="hidden lg:flex items-center gap-4">
          
          {/* ... (باقي كود النافبار زي ما هو) ... */}

          {/* Cart Button */}
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
            
            {/* --- 5. تعديل: استخدام itemCount من المخزن --- */}
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-emerald-500/60 ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* ... (باقي كود الموبايل زي ما هو، بس اتأكد إنك عدلت الـ itemCount جواه برضه) ... */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-emerald-100/50 shadow-2xl">
            <div className="px-4 py-5 space-y-2.5">
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-gray-700 font-semibold no-underline hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm"
              >
                {/* ... (أيقونة السلة) ... */}
                <span>Shopping Cart</span>
                
                {/* --- 6. تعديل: استخدام itemCount من المخزن --- */}
                {itemCount > 0 && (
                  <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-500/50">
                    {itemCount}
                  </span>
                )}
              </Link>
              {/* ... (باقي منيو الموبايل) ... */}
            </div>
          </div>
        )}

      </div>
    </header>
  )
}

export default Navbar;