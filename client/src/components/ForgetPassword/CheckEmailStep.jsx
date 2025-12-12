import { useState, useEffect } from "react";
import { ArrowLeft, Mail, CheckCircle, ExternalLink, Clock, Sparkles } from "lucide-react";
import Logo from "../common/Logo";

const CheckEmailStep = ({ email, onResend, onBackToLogin, isLoading }) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    onResend();
  };

  const handleOpenEmail = () => {
    const emailDomain = email.split("@")[1];
    let emailUrl = "mailto:";

    // Provide direct links to popular email providers
    if (emailDomain?.includes("gmail")) {
      emailUrl = "https://mail.google.com";
    } else if (emailDomain?.includes("yahoo")) {
      emailUrl = "https://mail.yahoo.com";
    } else if (emailDomain?.includes("outlook") || emailDomain?.includes("hotmail")) {
      emailUrl = "https://outlook.live.com";
    }

    window.open(emailUrl, "_blank");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      {/* Animated Background Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-20 top-20 h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-20 delay-100"></div>
        <div className="absolute right-1/4 top-1/3 h-3 w-3 animate-pulse rounded-full bg-teal-400 opacity-25"></div>
        <div className="absolute bottom-1/3 left-1/3 h-2 w-2 animate-bounce rounded-full bg-cyan-400 opacity-20"></div>
        <div className="absolute right-1/2 top-1/2 h-1 w-1 animate-ping rounded-full bg-emerald-300 opacity-15 delay-300"></div>
        <div className="absolute bottom-1/4 right-1/3 h-2 w-2 animate-pulse rounded-full bg-teal-300 opacity-25 delay-500"></div>
        <div className="absolute left-1/4 top-2/3 h-1 w-1 animate-bounce rounded-full bg-cyan-300 opacity-20 delay-700"></div>
      </div>

      <div className="animate-fadeIn w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl">
        <div className="grid gap-0 md:grid-cols-5">
          {/* Left Side - Visual Section */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-8 text-white md:col-span-2 md:p-12">
            {/* Animated Gradient Orbs */}
            <div className="absolute left-0 top-0 h-48 w-48 animate-pulse rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-2xl delay-700"></div>
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform animate-ping rounded-full bg-cyan-300/20 blur-2xl"></div>

            <div className="animate-slideInLeft relative z-10 text-center">
              {/* Animated Mail Icon with Success Badge */}
              <div className="group relative mb-6">
                {/* Pulsing Background Glow */}
                <div className="absolute inset-0 animate-ping opacity-20">
                  <div className="mx-auto h-32 w-32 rounded-full bg-white/40"></div>
                </div>

                {/* Main Icon Container */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full bg-white/30 blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 shadow-2xl backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                    <div className="relative">
                      <Mail className="h-14 w-14 animate-pulse text-white drop-shadow-lg" />
                      {/* Success Badge */}
                      <div className="absolute -bottom-1 -right-1 animate-bounce rounded-full bg-gradient-to-br from-emerald-400 to-green-500 p-1.5 shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <Sparkles className="absolute -right-1 -top-1 h-5 w-5 animate-pulse text-yellow-300" />
                </div>
              </div>

              <h2 className="mb-3 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                Check Your Email
              </h2>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-emerald-50 md:text-base">
                Follow the instructions in your email to securely reset your password
              </p>
            </div>
          </div>

          {/* Right Side - Content Section */}
          <div className="animate-slideInRight flex flex-col justify-center p-5 md:col-span-3 md:p-8">
            {/* Logo for mobile */}
            <div className="mb-3 flex justify-center md:hidden">
              <Logo />
            </div>

            {/* Logo for desktop */}
            <div className="mb-4 hidden justify-end md:flex">
              <Logo />
            </div>

            {/* Header */}
            <h1 className="mb-2 bg-gradient-to-r from-gray-800 to-emerald-600 bg-clip-text text-2xl font-bold text-gray-800 text-transparent md:text-3xl">
              Check your email
            </h1>
            <p className="mb-1 text-sm text-gray-600">
              If an account exists for this email, we've sent a reset link to
            </p>
            <p className="mb-4 truncate text-base font-semibold text-emerald-600">{email}</p>

            {/* Timer Notice */}
            <div className="animate-fadeIn mb-4 rounded-lg border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 transition-all delay-200 duration-300 hover:shadow-md">
              <p className="flex items-center gap-2 text-sm text-amber-800">
                <Clock className="h-4 w-4 flex-shrink-0 animate-pulse" />
                <span>
                  Link expires in <span className="font-bold">10 minutes</span>. Check your spam
                  folder if not received.
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="animate-fadeIn mb-4 grid gap-3 delay-300 md:grid-cols-2">
              {/* Open Email Button */}
              <button
                onClick={handleOpenEmail}
                className="group relative flex transform items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <span className="relative flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                  Open Email
                </span>
              </button>

              {/* Resend Button */}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                  countdown > 0 || isLoading
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                    : "transform border-emerald-500 bg-white text-emerald-600 hover:-translate-y-1 hover:bg-emerald-50 hover:shadow-md"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resending...
                  </span>
                ) : countdown > 0 ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Resend Email
                  </span>
                )}
              </button>
            </div>

            {/* Help Tips */}
            <div className="animate-fadeIn delay-400 mb-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-slate-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-lg">💡</span>
                Didn't receive it?
              </p>
              <div className="grid gap-x-3 gap-y-1.5 md:grid-cols-2">
                {[
                  "Check spam/junk folder",
                  "Verify email address is correct",
                  "Wait a few minutes for delivery",
                  "Email not registered? No link sent",
                ].map((tip, idx) => (
                  <p key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="animate-fadeIn flex items-center justify-between border-t border-gray-200 pt-4 delay-500">
              <button
                onClick={onBackToLogin}
                className="group flex items-center gap-2 text-gray-600 transition-all duration-300 hover:text-emerald-600"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back to Login</span>
              </button>

              <div className="text-xs text-gray-400 transition-colors duration-300 hover:text-gray-600">
                © 2025 AgriLink
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailStep;
