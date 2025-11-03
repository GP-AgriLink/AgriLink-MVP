import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {Formik, Form} from "formik";
import Logo from "../common/Logo";
import InputField from "./InputField";
import {loginValidationSchema} from "../../utils/validationSchemas";
import {sanitizeEmail} from "../../utils/sanitizers";

const LoginForm = () => {
  const navigate = useNavigate();
  const {login} = useAuth();

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values, {setSubmitting, setFieldError}) => {
    try {
      // Sanitize input before sending
      const sanitizedEmail = sanitizeEmail(values.email);
      const sanitizedPassword = values.password.trim();
      
      const result = await login(sanitizedEmail, sanitizedPassword);

      if (result.success) {
        navigate("/");
      } else {
        if (result.error.toLowerCase().includes("not found")) {
          setFieldError("email", "User not found");
        } else {
          setFieldError("password", result.error || "Login failed");
        }
      }
    } catch (err) {
      setFieldError("email", "Unexpected error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-[576px] flex flex-col items-center gap-1 p-8 bg-white/95 border border-[rgba(167,243,208,0.7)] rounded-[44px] shadow-[rgb(255,255,255)_0px_24px_48px_-32px] text-[#064e3b]">
      {/* Logo */}
      <div className="absolute -top-4 p-2 bg-white rounded-full">
        <Logo />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-4 w-full text-center mt-8">
        <span className="flex items-center px-4 py-1 bg-[#ecfdf5] text-[#047857] text-xs font-semibold tracking-[3.6px] uppercase rounded-full">
          Farmer Portal
        </span>
        <h1 className="text-[30px] font-bold leading-9 tracking-[-0.6px] text-[#022c22] font-['Inter']">
          Farmer Login
        </h1>
        <p className="text-sm leading-5 text-[rgba(6,78,59,0.75)] max-w-96">
          Secure access to your farm storefront and logistics tools. Enter your
          credentials to continue.
        </p>
      </div>

      {/* Formik Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => (
          <Form className="w-5/6" aria-label="Farmer login form">
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
            />

            <div className="mt-4">
              <InputField
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Log in to AgriLink"
              className={`w-full mt-6 inline-flex items-center justify-center px-6 py-3 bg-[#10b981] text-white font-semibold text-center rounded-full transition-all shadow-[rgba(40,86,56,0.65)_0px_30px_80px_-40px] ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-emerald-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </Form>
        )}
      </Formik>

      {/* Footer Links */}
      <p className="text-sm leading-5 text-[rgba(6,78,59,0.75)] mt-2">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="inline text-sm font-semibold leading-5 text-[#047857] hover:underline"
        >
          Sign Up
        </Link>
        &nbsp;/&nbsp;
        <Link
          to="/forgot-password"
          className="inline text-sm font-semibold leading-5 text-[#047857] hover:underline"
        >
          Forgot Password?
        </Link>
      </p>

      {/* Background */}
      <div className="absolute inset-0 -z-10 rounded-[48px] pointer-events-none bg-[radial-gradient(circle_at_center_top,rgba(35,97,69,0.15),rgba(0,0,0,0)_60%),radial-gradient(circle_at_center_bottom,rgba(52,120,88,0.12),rgba(0,0,0,0)_55%)]" />
    </div>
  );
};

export default LoginForm;
