import React from "react";

/**
 * Provides a centered, responsive layout for authentication pages (Login/Register).
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradient elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-emerald-200/30 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 animate-pulse rounded-full bg-teal-200/30 opacity-50 blur-3xl [animation-delay:-2s]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
};

export default AuthLayout;
