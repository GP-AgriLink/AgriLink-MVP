import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import Logo from "../common/Logo";
import InputField from "./InputField"; 
import { loginValidationSchema } from "../../utils/validationSchemas";
import { sanitizeEmail } from "../../utils/sanitizers";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const sanitizedEmail = sanitizeEmail(values.email);
      const sanitizedPassword = values.password.trim();

      // Call the login function from AuthContext
      const result = await login(sanitizedEmail, sanitizedPassword);

      if (result.success) {
        // Success: show role-based toast and navigate
        const role = result.user?.role || "user";
        const welcomeMessage =
          role === "farmer"
            ? "Farmer login successful. Redirecting to your dashboard..."
            : "Login successful. Welcome!";

        toast.success(welcomeMessage, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          style: { backgroundColor: "#10b981", color: "white" },
        });

        // User object includes role
        if (result.user.role === "farmer") {
          navigate("/dashboard", { state: { activeView: "profile" } });
        } else {
          navigate("/discover"); // Customers go to discover page
        }
      } else {
        // Error handling
        toast.error(result.error || "Login failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          style: { backgroundColor: "#ef4444", color: "white" },
        });
        setFieldError("password", result.error || "Login failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        style: { backgroundColor: "#ef4444", color: "white" },
      });
      setFieldError("email", "Unexpected error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex w-full max-w-[576px] flex-col items-center gap-1 rounded-[44px] border border-[rgba(167,243,208,0.7)] bg-white/95 p-8 text-[#064e3b] shadow-2xl">
      {/* Logo */}
      <div className="absolute -top-4 rounded-full bg-white p-2">
        <Logo />
      </div>

      {/* Header */}
      <div className="mt-8 flex w-full flex-col items-center gap-4 text-center">
        <span className="flex items-center rounded-full bg-[#ecfdf5] px-4 py-1 text-xs font-semibold uppercase tracking-[3.6px] text-[#047857]">
          Welcome Back
        </span>
        <h1 className="font-['Inter'] text-[30px] font-bold leading-9 tracking-[-0.6px] text-[#022c22]">
          Login to AgriLink
        </h1>
        <p className="max-w-96 text-sm leading-5 text-[rgba(6,78,59,0.75)]">
          Securely log in to manage your farm or discover and shop from local producers.
        </p>
      </div>

      {/* Formik Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="w-full max-w-sm" aria-label="Login form">
            <Field
              as={InputField}
              label="Email"
              type="email"
              name="email"
              placeholder="your.email@example.com"
              error={touched.email && errors.email}
            />

            <div className="mt-4">
              <Field
                as={InputField}
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                error={touched.password && errors.password}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Log in to AgriLink"
              className={`mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#10b981] px-6 py-3 text-center font-semibold text-white shadow-[rgba(40,86,56,0.65)_0px_30px_80px_-40px] transition-all ${
                isSubmitting
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-emerald-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </Form>
        )}
      </Formik>

      {/* Footer Links */}
      <p className="mt-4 text-sm leading-5 text-[rgba(6,78,59,0.75)]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="inline text-sm font-semibold leading-5 text-[#047857] hover:underline"
        >
          Sign Up
        </Link>
      </p>
      <p className="mt-1 text-sm leading-5 text-[rgba(6,78,59,0.75)]">
        <Link
          to="/forgot-password"
          className="inline text-sm font-semibold leading-5 text-[#047857] hover:underline"
        >
          Forgot Password?
        </Link>
      </p>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[48px] bg-[radial-gradient(circle_at_center_top,rgba(35,97,69,0.15),rgba(0,0,0,0)_60%),radial-gradient(circle_at_center_bottom,rgba(52,120,88,0.12),rgba(0,0,0,0)_55%)]" />
    </div>
  );
};

export default LoginForm;
