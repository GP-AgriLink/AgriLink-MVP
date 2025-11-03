import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import InputField from "./InputField";
import Logo from "../common/Logo";
import {Formik, Form} from "formik";
import {registrationValidationSchema} from "../../utils/validationSchemas";
import {sanitizeEmail, sanitizeFarmName} from "../../utils/sanitizers";

const SignupForm = () => {
  const navigate = useNavigate();
  const {register} = useAuth();

  return (
    <div className="relative w-full max-w-[576px] flex flex-col items-center gap-1 p-8 bg-white/95 border border-[rgba(167,243,208,0.7)] rounded-[44px] shadow-[rgb(255,255,255)_0px_24px_48px_-32px] text-[#064e3b]">
      {/* Logo positioned at top */}
      <div className="absolute -top-4 p-2 bg-white rounded-full">
        <Logo />
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 w-full text-center mt-8">
        <span className="flex items-center px-4 py-1 bg-[#ecfdf5] text-[#047857] text-xs font-semibold tracking-[3.6px] uppercase rounded-full">
          Farmer Portal
        </span>
        <h1 className="text-[30px] font-bold leading-9 tracking-[-0.6px] text-[#022c22] font-['Inter']">
          Farmer Sign Up
        </h1>
        <p className="text-sm leading-5 text-[rgba(6,78,59,0.75)] max-w-96">
          Create your farm account and start connecting with customers. Enter
          your details to continue.
        </p>
      </div>

      {/* Formik Form */}
      <Formik
        initialValues={{
          farmName: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={registrationValidationSchema}
        onSubmit={async (values, {setSubmitting, setFieldError}) => {
          try {
            const sanitizedFarmName = sanitizeFarmName(values.farmName);
            const sanitizedEmail = sanitizeEmail(values.email);
            const sanitizedPassword = values.password.trim();
            
            const cleanedPhone = values.phoneNumber.replace(/[\s-]/g, '');
            const phoneWithCountryCode = cleanedPhone.startsWith('0') 
              ? `+20${cleanedPhone.substring(1)}`
              : `+20${cleanedPhone}`;
            
            const result = await register(
              sanitizedFarmName,
              sanitizedEmail,
              sanitizedPassword,
              phoneWithCountryCode
            );

            if (result.success) {
              navigate("/");
            } else {
              // Show backend error under the correct field if available
              if (result.field && result.error) {
                setFieldError(result.field, result.error);
              } else {
                setFieldError("email", result.error || "Registration failed");
              }
            }
          } catch (err) {
            setFieldError(
              "email",
              "An unexpected error occurred. Please try again."
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => (
          <Form className="w-5/6" aria-label="Farmer signup form">
            <InputField
              label="Farm Name"
              name="farmName"
              type="text"
              placeholder="Enter your farm name"
              value={values.farmName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.farmName && errors.farmName}
            />

            <div className="mt-4">
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
              />
            </div>

            <div className="mt-4">
              <InputField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                placeholder="01012345678"
                value={values.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phoneNumber && errors.phoneNumber}
              />
            </div>

            <div className="mt-4">
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
              />
            </div>

            <div className="mt-4">
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && errors.confirmPassword}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Sign up to AgriLink"
              className={`w-full mt-6 inline-flex items-center justify-center px-6 py-3 bg-[#10b981] text-white font-semibold text-center rounded-full transition-all shadow-[rgba(40,86,56,0.65)_0px_30px_80px_-40px] ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-emerald-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </Form>
        )}
      </Formik>

      <p className="text-sm leading-5 text-[rgba(6,78,59,0.75)]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="inline text-sm font-semibold leading-5 text-[#047857] hover:underline"
        >
          Login
        </Link>
      </p>

      <div className="absolute inset-0 -z-10 rounded-[48px] pointer-events-none bg-[radial-gradient(circle_at_center_top,rgba(35,97,69,0.15),rgba(0,0,0,0)_60%),radial-gradient(circle_at_center_bottom,rgba(52,120,88,0.12),rgba(0,0,0,0)_55%)]" />
    </div>
  );
};

export default SignupForm;
