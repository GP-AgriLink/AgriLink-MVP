import React from "react";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import Logo from "../common/Logo";

const PasswordChangedStep = ({ onLogin }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      {/* Animated Background Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
        <div className="absolute right-1/3 top-1/3 h-3 w-3 animate-pulse rounded-full bg-teal-400 opacity-25"></div>
        <div className="absolute bottom-1/4 left-1/3 h-2 w-2 animate-bounce rounded-full bg-cyan-400 opacity-20"></div>
        <div className="absolute right-1/4 top-1/2 h-1 w-1 animate-ping rounded-full bg-emerald-300 opacity-15 delay-300"></div>
        <div className="absolute bottom-1/3 right-1/2 h-2 w-2 animate-pulse rounded-full bg-teal-300 opacity-25 delay-500"></div>
      </div>

      <div className="animate-fadeIn relative w-full max-w-md rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Decorative Gradient Orbs */}
        <div className="absolute right-0 top-0 -z-10 h-40 w-40 animate-pulse rounded-full bg-emerald-100/50 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 animate-pulse rounded-full bg-teal-100/50 opacity-30 blur-2xl delay-700"></div>

        {/* Logo */}
        <div className="animate-slideInDown mb-8 flex justify-center">
          <Logo className="" />
        </div>

        {/* Success Icon */}
        <div className="animate-slideInUp mb-6 flex justify-center">
          <div className="group relative">
            {/* Outer Ping Ring */}
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="h-32 w-32 rounded-full bg-green-200"></div>
            </div>

            {/* Main Container */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl transition-transform duration-500 group-hover:scale-110">
                <CheckCircle className="h-16 w-16 animate-bounce text-green-600 drop-shadow-lg" />
              </div>
              <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-pulse text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="animate-fadeIn mb-2 bg-gradient-to-r from-gray-800 to-emerald-600 bg-clip-text text-center text-3xl font-bold text-transparent delay-200">
          Password Changed!
        </h1>
        <p className="animate-fadeIn mb-8 text-center text-sm text-gray-600 delay-300">
          You've successfully completed your password reset! You can now log in with your new
          password.
        </p>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className="animate-fadeIn delay-400 group relative mb-4 w-full transform overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
          <span className="relative flex items-center justify-center gap-2">
            Log in Now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>

        {/* Security Tip */}
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 delay-500">
          <p className="flex items-center gap-2 text-xs text-blue-700">
            <span className="text-sm">🔒</span>
            <span>Keep your password secure and don't share it with anyone</span>
          </p>
        </div>

        {/* Footer */}
        <div className="animate-fadeIn delay-600 flex justify-between border-t border-gray-200 pt-6 text-xs text-gray-400">
          <span className="transition-colors duration-300 hover:text-gray-600">
            © 2025 AgriLink
          </span>
          <span className="cursor-pointer transition-colors duration-300 hover:text-gray-600">
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangedStep;
