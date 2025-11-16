import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Logo from "../components/common/Logo";
import { useAuth } from "../context/AuthContext";
import { sanitizeString } from "../utils/sanitizers";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password exceeds maximum length")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,
      "Password must include uppercase, lowercase, number, and special character (@$!%*?&)"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  // Don't render if user is authenticated
  if (user) {
    return null;
  }
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!token || token.length < 10) {
      toast.error("Invalid password reset link");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);

    try {
      const sanitizedPassword = sanitizeString(values.password.trim());

      if (!sanitizedPassword || sanitizedPassword.length < 6) {
        toast.error("Invalid password format");
        setIsLoading(false);
        return;
      }

      const response = await axios.put(`${API_URL}/api/users/reset-password/${token}`, {
        password: sanitizedPassword,
      });

      setIsSuccess(true);

      toast.success("Password reset successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Password reset link has expired. Please request a new one", {
          position: "top-right",
          autoClose: 4000,
        });

        setTimeout(() => {
          navigate("/forgot-password");
        }, 2000);
      } else if (err.response?.status === 404) {
        toast.error("Invalid reset link. Please request a new one", {
          position: "top-right",
          autoClose: 4000,
        });

        setTimeout(() => {
          navigate("/forgot-password");
        }, 2000);
      } else {
        toast.error("Unable to reset password. Please try again", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
          {/* Decorative Background */}
          <div className="absolute right-0 top-0 -z-10 h-40 w-40 rounded-full bg-emerald-100 opacity-30 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 rounded-full bg-teal-100 opacity-30 blur-2xl"></div>

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <div className="h-32 w-32 rounded-full bg-green-200 opacity-20"></div>
              </div>
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="mb-3 text-center text-3xl font-bold text-gray-800">Password Changed!</h1>
          <p className="mb-8 px-4 text-center text-sm text-gray-600">
            Your password has been successfully reset. Redirecting to login...
          </p>

          {/* Loading Indicator */}
          <div className="flex justify-center">
            <svg
              className="h-8 w-8 animate-spin text-emerald-600"
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
          </div>

          {/* Footer */}
          <div className="mt-12 flex justify-between border-t border-gray-200 pt-6 text-xs text-gray-400">
            <span>© 2025 AgriLink</span>
            <span className="cursor-pointer transition hover:text-emerald-600">Privacy Policy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Left Side - Visual Section */}
          <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-8 text-white lg:p-12">
            {/* Decorative Elements */}
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/20 shadow-2xl backdrop-blur-sm">
                  <Lock className="h-16 w-16 text-white" />
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold lg:text-3xl">Create New Password</h2>
              <p className="mx-auto mb-6 max-w-sm text-base text-emerald-50 lg:text-lg">
                Your new password must be different from previously used passwords and meet our
                security requirements.
              </p>

              <div className="mx-auto max-w-sm rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="mb-2 text-sm font-semibold text-emerald-50">🔒 Security Tips:</p>
                <ul className="space-y-2 text-left text-xs text-emerald-50">
                  <li>• Use a mix of letters, numbers & symbols</li>
                  <li>• Make it at least 6 characters long</li>
                  <li>• Avoid common words or patterns</li>
                  <li>• Don't reuse old passwords</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="flex flex-col justify-center p-5 lg:p-10">
            {/* Logo for mobile */}
            <div className="mb-4 flex justify-center lg:hidden">
              <Logo />
            </div>

            {/* Logo for desktop */}
            <div className="mb-4 hidden justify-end lg:flex">
              <Logo />
            </div>

            {/* Header */}
            <h1 className="mb-1.5 text-2xl font-bold text-gray-800 lg:text-3xl">
              Reset Your Password
            </h1>
            <p className="mb-3 text-xs text-gray-500">
              Enter your new password below. Make it strong and unique!
            </p>

            {/* Security Info - Compact */}
            <div className="mb-4 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-2">
              <p className="flex items-center gap-2 text-xs text-blue-700">
                <span>🔒</span>
                <span>This link expires in 10 minutes for your security</span>
              </p>
            </div>

            {/* Formik Form */}
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
                <Form>
                  {/* Password Field - Compact */}
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border py-2.5 pl-11 pr-11 ${
                          touched.password && errors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        } rounded-lg text-sm shadow-sm outline-none transition`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field - Compact */}
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border py-2.5 pl-11 pr-11 ${
                          touched.confirmPassword && errors.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        } rounded-lg text-sm shadow-sm outline-none transition`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Requirements - Ultra compact 2-column */}
                  <div className="mb-4 rounded-lg bg-gray-50 p-2.5">
                    <p className="mb-1.5 text-xs font-semibold text-gray-700">
                      Password Requirements:
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            values.password.length >= 6
                              ? "text-sm text-green-600"
                              : "text-sm text-gray-400"
                          }
                        >
                          ✓
                        </span>
                        <span className="text-xs text-gray-600">6+ characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            /[A-Z]/.test(values.password)
                              ? "text-sm text-green-600"
                              : "text-sm text-gray-400"
                          }
                        >
                          ✓
                        </span>
                        <span className="text-xs text-gray-600">Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            /[a-z]/.test(values.password)
                              ? "text-sm text-green-600"
                              : "text-sm text-gray-400"
                          }
                        >
                          ✓
                        </span>
                        <span className="text-xs text-gray-600">Lowercase</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            /\d/.test(values.password)
                              ? "text-sm text-green-600"
                              : "text-sm text-gray-400"
                          }
                        >
                          ✓
                        </span>
                        <span className="text-xs text-gray-600">Number</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <span
                          className={
                            /[@$!%*?&]/.test(values.password)
                              ? "text-sm text-green-600"
                              : "text-sm text-gray-400"
                          }
                        >
                          ✓
                        </span>
                        <span className="text-xs text-gray-600">Special character (@$!%*?&)</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button - Compact */}
                  <button
                    type="submit"
                    disabled={isLoading || !isValid || !dirty}
                    className={`mb-3 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 font-semibold text-white shadow-md transition-all ${
                      isLoading || !isValid || !dirty
                        ? "cursor-not-allowed opacity-50"
                        : "transform hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin text-white"
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
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Footer - Inline */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-400">
              <span>© 2025 AgriLink</span>
              <span className="cursor-pointer transition hover:text-emerald-600">
                Privacy Policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
