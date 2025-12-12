import React from 'react';
import { Link } from 'react-router-dom';

const EmptyCart = () => {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-10 px-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="relative flex flex-col items-center justify-center max-w-4xl w-full text-center z-10 gap-6">

        {/* Header Title */}
        <h1 className="text-4xl md:text-5xl font-semibold text-emerald-900 mb-2">
          Your Cart is Empty
        </h1>

        <div className="flex items-center justify-center h-[220px] w-[220px] md:h-[260px] md:w-[260px]">
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cart_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#14b8a6" stopOpacity=".85" />
              </linearGradient>
              <linearGradient id="wheel_gradient" x1="5" y1="19" x2="19" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#059669" />
                <stop offset="1" stopColor="#0d9488" />
              </linearGradient>
              <filter id="glow" x="-4" y="-4" width="32" height="32" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Cart Body */}
            <path
              d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17"
              stroke="url(#cart_gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="url(#cart_gradient)"
              fillOpacity="0.1"
            />

            <circle cx="9" cy="21" r="1.5" fill="url(#wheel_gradient)" />
            <circle cx="20" cy="21" r="1.5" fill="url(#wheel_gradient)" />

            <g className="animate-bounce" style={{ animationDuration: '3s' }}>
              <circle cx="12" cy="9" r="1" fill="#10b981" opacity="0.6" />
              <circle cx="16" cy="7" r="0.5" fill="#14b8a6" opacity="0.5" />
            </g>
          </svg>
        </div>

        {/* Subtext */}
        <div className="flex items-center text-center flex-col max-w-md">
          <p className="text-xl font-semibold text-emerald-800">
            Looks like you haven't added any products yet.
          </p>
          <p className="text-emerald-600/80 mt-2">
            Explore our fresh farm products and support local farmers today.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center items-center mt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 shadow-md hover:-translate-y-1 hover:scale-105"
          >
            Start Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default EmptyCart;