import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

import { sanitizeString } from '../utils/sanitizers';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password exceeds maximum length')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,
      'Password must include uppercase, lowercase, number, and special character (@$!%*?&)'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard with profile view
    if (user) {
      navigate('/dashboard', { 
        replace: true,
        state: { activeView: 'profile' }
      });
    }
  }, [user, navigate]);

  // Don't render if user is authenticated
  if (user) {
    return null;
  }
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token || token.length < 10) {
      toast.error('Invalid password reset link');
      navigate('/forgot-password');
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
      
      const response = await axios.put(
        `${API_URL}/api/farmers/reset-password/${token}`,
        { password: sanitizedPassword }
      );

      setIsSuccess(true);
      
      toast.success("Password reset successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Password reset link has expired. Please request a new one", {
          position: "top-right",
          autoClose: 4000,
        });
        
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      } else if (err.response?.status === 404) {
        toast.error("Invalid reset link. Please request a new one", {
          position: "top-right",
          autoClose: 4000,
        });
        
        setTimeout(() => {
          navigate('/forgot-password');
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100 rounded-full blur-2xl opacity-30 -z-10"></div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <div className="w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
              </div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
            Password Changed!
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8 px-4">
            Your password has been successfully reset. Redirecting to login...
          </p>

          {/* Loading Indicator */}
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-emerald-600"
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
          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-400">
            <span>© 2025 AgriLink</span>
            <span className="hover:text-emerald-600 cursor-pointer transition">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          
          {/* Left Side - Visual Section */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-8 lg:p-12 flex flex-col justify-center items-center text-white">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                  <Lock className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Create New Password
              </h2>
              <p className="text-emerald-50 text-base lg:text-lg mb-6 max-w-sm mx-auto">
                Your new password must be different from previously used passwords and meet our security requirements.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-sm mx-auto">
                <p className="text-sm text-emerald-50 mb-2 font-semibold">🔒 Security Tips:</p>
                <ul className="text-xs text-emerald-50 space-y-2 text-left">
                  <li>• Use a mix of letters, numbers & symbols</li>
                  <li>• Make it at least 6 characters long</li>
                  <li>• Avoid common words or patterns</li>
                  <li>• Don't reuse old passwords</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="p-5 lg:p-10 flex flex-col justify-center">
            {/* Logo for mobile */}
            <div className="flex justify-center mb-4 lg:hidden">
              <Logo />
            </div>
            
            {/* Logo for desktop */}
            <div className="hidden lg:flex justify-end mb-4">
              <Logo />
            </div>

        {/* Header */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1.5">
          Reset Your Password
        </h1>
        <p className="text-gray-500 text-xs mb-3">
          Enter your new password below. Make it strong and unique!
        </p>
        
        {/* Security Info - Compact */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-2 mb-4">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <span>🔒</span>
            <span>This link expires in 10 minutes for your security</span>
          </p>
        </div>

        {/* Formik Form */}
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
            <Form>
              {/* Password Field - Compact */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-11 pr-11 py-2.5 border ${
                      touched.password && errors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    } rounded-lg outline-none transition text-sm shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-11 pr-11 py-2.5 border ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    } rounded-lg outline-none transition text-sm shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              <div className="mb-4 bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={values.password.length >= 6 ? 'text-green-600 text-sm' : 'text-gray-400 text-sm'}>
                      ✓
                    </span>
                    <span className="text-xs text-gray-600">6+ characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/[A-Z]/.test(values.password) ? 'text-green-600 text-sm' : 'text-gray-400 text-sm'}>
                      ✓
                    </span>
                    <span className="text-xs text-gray-600">Uppercase</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/[a-z]/.test(values.password) ? 'text-green-600 text-sm' : 'text-gray-400 text-sm'}>
                      ✓
                    </span>
                    <span className="text-xs text-gray-600">Lowercase</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/\d/.test(values.password) ? 'text-green-600 text-sm' : 'text-gray-400 text-sm'}>
                      ✓
                    </span>
                    <span className="text-xs text-gray-600">Number</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span className={/[@$!%*?&]/.test(values.password) ? 'text-green-600 text-sm' : 'text-gray-400 text-sm'}>
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
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg font-semibold transition-all mb-3 shadow-md ${
                  isLoading || !isValid || !dirty
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  'Reset Password'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Footer - Inline */}
        <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
          <span>© 2025 AgriLink</span>
          <span className="hover:text-emerald-600 cursor-pointer transition">
            Privacy Policy
          </span>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
