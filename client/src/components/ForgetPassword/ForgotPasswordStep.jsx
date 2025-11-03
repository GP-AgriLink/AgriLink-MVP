import { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Logo from '../common/Logo';
import { sanitizeEmail } from '../../utils/sanitizers';

const validationSchema = Yup.object({
  email: Yup.string()
    .transform(sanitizeEmail)
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    )
    .email('Invalid email format')
    .max(255, "Email exceeds maximum length")
    .required('Email is required'),
});

const ForgotPasswordStep = ({ onNext, isLoading, onBackToLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          
          {/* Left Side - Visual Section */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-12 hidden md:flex flex-col justify-center items-center text-white">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                  <Lock className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Secure Password Recovery
              </h2>
              <p className="text-emerald-50 text-lg mb-6 max-w-sm">
                Don't worry! We'll help you regain access to your AgriLink account safely and securely.
              </p>
              
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-sm text-emerald-50">Enter your registered email address</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-sm text-emerald-50">Receive a secure reset link via email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-sm text-emerald-50">Create a new strong password</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="p-6 md:p-10 flex flex-col justify-center">
            {/* Logo for mobile */}
            <div className="flex justify-center mb-4 md:hidden">
              <Logo />
            </div>
            
            {/* Logo for desktop - top right */}
            <div className="hidden md:flex justify-end mb-4">
              <Logo />
            </div>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Forgot your password?
        </h1>
        <p className="text-gray-500 text-sm mb-3">
          Enter your email and we'll send you a reset link.
        </p>
        
        {/* Security Notice - Compact inline banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-2 mb-4">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <span>🔒</span>
            <span>Your privacy is protected - account existence will not be revealed</span>
          </p>
        </div>

        {/* Formik Form */}
        <Formik
          initialValues={{ email: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            onNext(values.email);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
            <Form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-11 pr-4 py-2.5 border ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    } rounded-lg outline-none transition text-sm shadow-sm`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

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
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Back to Login - Inline with footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <button 
            onClick={onBackToLogin}
            className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium">Back to Login</span>
          </button>
          
          <div className="text-xs text-gray-400">
            © 2025 AgriLink
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordStep;