import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Sparkles, Shield } from "lucide-react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Logo from "../common/Logo";
import { sanitizeEmail } from "../../utils/sanitizers";

const validationSchema = Yup.object({
  email: Yup.string()
    .transform(sanitizeEmail)
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
    .email("Invalid email format")
    .max(255, "Email exceeds maximum length")
    .required("Email is required"),
});

const ForgotPasswordStep = ({ onNext, isLoading, onBackToLogin }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      {/* Animated Gradient Waves */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <motion.div
          className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-1/4 top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute -bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Advanced Floating Particles with Mouse Tracking */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-1 w-1 rounded-full ${
              i % 3 === 0 ? "bg-emerald-400" : i % 3 === 1 ? "bg-teal-400" : "bg-cyan-400"
            }`}
            style={{
              left: `${10 + ((i * 8) % 80)}%`,
              top: `${15 + ((i * 7) % 70)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Main Card with Animated Border */}
      <motion.div
        className="group relative w-full max-w-4xl overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated Gradient Border */}
        <motion.div
          className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 blur-sm"
          animate={{
            opacity: [0.75, 1, 0.75],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Left Side - Visual Section with Animated Gradient */}
            <div className="relative hidden flex-col items-center justify-center overflow-hidden p-12 text-white md:flex">
              {/* Animated Gradient Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              />

              {/* Multi-layered Animated Gradient Orbs */}
              <motion.div
                className="absolute left-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-white/20 to-emerald-300/10 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-gradient-to-tl from-white/15 to-teal-300/10 blur-3xl"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300/20 to-emerald-300/20 blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="relative z-10 text-center"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Enhanced Lock Icon with Multi-Layer Glow */}
                <div className="group relative mb-8">
                  {/* Outer Glow Rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300/30 to-cyan-300/30 blur-2xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full bg-white/20 blur-xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />

                  {/* Main Icon Container */}
                  <motion.div
                    className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-br from-white/25 to-white/10 shadow-2xl backdrop-blur-md"
                    whileHover={{
                      scale: 1.1,
                      borderColor: "rgba(255, 255, 255, 0.6)",
                      boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.5)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Background Shield */}
                    <Shield className="absolute h-20 w-20 text-white/10 blur-sm" />

                    {/* Main Lock Icon */}
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                      <Lock className="relative h-16 w-16 text-white drop-shadow-2xl" />
                    </motion.div>

                    {/* Sparkle Effects */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.6, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-300 drop-shadow-lg" />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.8, 0.4, 0.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    >
                      <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-cyan-200" />
                    </motion.div>
                  </motion.div>
                </div>

                <h2 className="mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-3xl font-bold text-transparent">
                  Secure Password Recovery
                </h2>
                <p className="mb-8 max-w-sm text-lg leading-relaxed text-emerald-50">
                  Don't worry! We'll help you regain access to your AgriLink account safely and
                  securely.
                </p>

                {/* Process Steps */}
                <div className="mx-auto max-w-sm space-y-4 text-left">
                  {[
                    { text: "Enter your registered email address", delay: 0.1 },
                    { text: "Receive a secure reset link via email", delay: 0.2 },
                    { text: "Create a new strong password", delay: 0.3 },
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: step.delay }}
                      whileHover={{ x: 8, transition: { duration: 0.2 } }}
                    >
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/25 backdrop-blur-sm">
                        <span className="text-sm font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-emerald-50">{step.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side - Form Section */}
            <motion.div
              className="flex flex-col justify-center p-6 md:p-10"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Logo for mobile */}
              <div className="mb-4 flex justify-center md:hidden">
                <Logo />
              </div>

              {/* Logo for desktop - top right */}
              <div className="mb-4 hidden justify-end md:flex">
                <Logo />
              </div>

              {/* Header */}
              <h1 className="mb-2 bg-gradient-to-r from-gray-800 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                Forgot your password?
              </h1>
              <p className="mb-4 text-sm text-gray-500">
                Enter your email and we'll send you a reset link.
              </p>

              {/* Security Notice */}
              <motion.div
                className="mb-5 rounded-lg border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 transition-all duration-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <p className="flex items-center gap-2 text-xs text-blue-700">
                  <span className="text-lg">🔒</span>
                  <span>Your privacy is protected - account existence will not be revealed</span>
                </p>
              </motion.div>

              {/* Formik Form */}
              <Formik
                initialValues={{ email: "" }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  onNext(values.email);
                }}
              >
                {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
                  <Form>
                    <motion.div
                      className="mb-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail
                            className={`h-5 w-5 transition-colors duration-300 ${
                              touched.email && !errors.email && values.email
                                ? "text-emerald-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <input
                          type="email"
                          name="email"
                          placeholder="your.email@example.com"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full border-2 py-3 pl-11 pr-4 ${
                            touched.email && errors.email
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : touched.email && !errors.email && values.email
                                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                                : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                          } rounded-xl text-sm shadow-sm outline-none transition-all duration-300 hover:shadow-md focus:shadow-lg`}
                        />
                        {touched.email && !errors.email && values.email && (
                          <motion.div
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <svg
                              className="h-5 w-5 text-emerald-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      {touched.email && errors.email && (
                        <motion.p
                          className="mt-2 text-xs text-red-600"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.button
                      type="submit"
                      disabled={isLoading || !isValid || !dirty}
                      className={`group relative mb-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 ${
                        isLoading || !isValid || !dirty
                          ? "cursor-not-allowed opacity-50"
                          : "hover:shadow-2xl"
                      }`}
                      whileHover={
                        !isLoading && isValid && dirty
                          ? { y: -2, transition: { duration: 0.2 } }
                          : {}
                      }
                      whileTap={
                        !isLoading && isValid && dirty
                          ? { y: 0, transition: { duration: 0.1 } }
                          : {}
                      }
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin text-white"
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
                            Sending...
                          </>
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </motion.div>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </Form>
                )}
              </Formik>

              {/* Back to Login */}
              <motion.div
                className="flex items-center justify-between border-t border-gray-200 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <motion.button
                  onClick={onBackToLogin}
                  className="group flex items-center gap-2 text-gray-600 transition-all duration-300 hover:text-emerald-600"
                  whileHover={{ x: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300" />
                  <span className="text-sm font-medium">Back to Login</span>
                </motion.button>

                <div className="text-xs text-gray-400 transition-colors duration-300 hover:text-gray-600">
                  © 2025 AgriLink
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordStep;
