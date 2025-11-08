import React from "react";
import Logo from "./Logo";

/**
 * LogoSpinner
 * A full-area overlay spinner with the AgriLink logo.
 * To be used inside a container with `position: relative`.
 */
const LogoSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Stationary Logo */}
        <Logo iconOnly={true} iconContainerClass="w-16 h-16" />

        {/* Spinning Border */}
        <div className="absolute inset-0 h-full w-full animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-emerald-700">{message}</p>
    </div>
  );
};

export default LogoSpinner;
