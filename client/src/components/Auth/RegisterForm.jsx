import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import InputField from "./InputField";
import { registrationValidationSchema } from "../../utils/validationSchemas";
import { sanitizeEmail, sanitizeFarmName, sanitizePhone } from "../../utils/sanitizers";

/**
 * A reusable registration form that adapts to "customer" or "farmer" roles.
 * @param {{role: 'customer' | 'farmer'}} props
 */
const RegisterForm = ({ role }) => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // API: farmName is only required for 'farmer' role
  const initialValues = {
    farmName: "", // Conditionally used
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Sanitize all inputs
      const sanitizedEmail = sanitizeEmail(values.email);
      const sanitizedPassword = values.password.trim();
      const cleanedPhone = sanitizePhone(values.phoneNumber);

      // Conditionally sanitize and pass farmName only if role is 'farmer'
      const sanitizedFarmName = role === "farmer" ? sanitizeFarmName(values.farmName) : undefined;

      // Call the register function from AuthContext
      const result = await register(
        sanitizedFarmName, // Will be undefined for customers, which is correct
        sanitizedEmail,
        sanitizedPassword,
        cleanedPhone,
        role // Pass the role
      );

      if (result.success) {
        const roleName = role.charAt(0).toUpperCase() + role.slice(1);
        toast.success(`${roleName} account created! Redirecting...`, {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
          style: { backgroundColor: "#10b981", color: "white" },
        });

        // User object includes role
        if (result.user.role === "farmer") {
          navigate("/dashboard");
        } else {
          navigate("/discover"); // Customers go to discover page
        }
      } else {
        // Error handling
        toast.error(result.error || "Registration failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          style: { backgroundColor: "#ef4444", color: "white" },
        });

        // Show backend error under the correct field if available
        if (result.field && result.error) {
          setFieldError(result.field, result.error);
        } else {
          setFieldError("email", result.error || "Registration failed");
        }
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
    <Formik
      initialValues={initialValues}
      // Pass the role to the validation schema context so it can be conditional
      validationSchema={registrationValidationSchema(role)}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="w-full" aria-label={`${role} signup form`}>
          {/* --- CONDITIONAL FARMER FIELD --- */}
          {role === "farmer" && (
            <Field
              as={InputField}
              label="Farm Name"
              name="farmName"
              type="text"
              placeholder="Enter your farm name"
              error={touched.farmName && errors.farmName}
            />
          )}

          <div className="mt-4">
            <Field
              as={InputField}
              label="Email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              error={touched.email && errors.email}
            />
          </div>

          <div className="mt-4">
            <Field
              as={InputField}
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="01012345678"
              error={touched.phoneNumber && errors.phoneNumber}
            />
          </div>

          <div className="mt-4">
            <Field
              as={InputField}
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              error={touched.password && errors.password}
            />
          </div>

          <div className="mt-4">
            <Field
              as={InputField}
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              error={touched.confirmPassword && errors.confirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-label="Sign up to AgriLink"
            className={`mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#10b981] px-6 py-3 text-center font-semibold text-white shadow-[rgba(40,86,56,0.65)_0px_30px_80px_-40px] transition-all ${
              isSubmitting
                ? "cursor-not-allowed opacity-70"
                : "hover:bg-emerald-600 hover:shadow-lg"
            }`}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-sm leading-5 text-[rgba(6,78,59,0.75)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="inline text-sm font-semibold leading-5 text-[#047857] hover:underline"
            >
              Login
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
};

export default RegisterForm;
