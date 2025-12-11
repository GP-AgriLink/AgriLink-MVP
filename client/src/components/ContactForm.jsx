import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, MessageSquare, Check, AlertCircle, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { contactUsValidationSchema } from "../utils/validationSchemas";
import { sanitizeName, sanitizeEmail, sanitizeTextArea } from "../utils/sanitizers";

const ContactForm = () => {
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = (values, { resetForm }) => {
    setSubmitLoading(true);

    const SERVICE_ID = "service_6pcmjqd";
    const TEMPLATE_ID = "template_nh7t3bh";
    const PUBLIC_KEY = "m_7OqQFJ2pd4mzNpm";

    // Sanitize values before sending
    const sanitizedValues = {
      name: sanitizeName(values.name),
      email: sanitizeEmail(values.email),
      message: sanitizeTextArea(values.message),
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, sanitizedValues, PUBLIC_KEY).then(
      (response) => {
        // console.log("SUCCESS!", response.status, response.text);

        toast.success("Message sent successfully! We'll be in touch soon.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        resetForm();
        setSubmitLoading(false);
      },
      (err) => {
        console.log("FAILED...", err);

        toast.error("Failed to send message. Please try again.", {
          position: "top-right",
          autoClose: 7000,
        });

        setSubmitLoading(false);
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-[28px] border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 md:p-12"
    >
      {/* Decorative gradient blur */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-2xl transition-all duration-300 group-hover:scale-150" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-teal-400/10 to-emerald-400/10 blur-2xl transition-all duration-300 group-hover:scale-150" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-4xl font-bold text-transparent">
            Send us a Message
          </h2>
          <p className="mb-10 text-base text-emerald-700/70">
            Fill out the form below and we'll get back to you shortly.
          </p>
        </motion.div>

        <Formik
          initialValues={{
            name: "",
            email: "",
            message: "",
          }}
          validationSchema={contactUsValidationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ errors, touched, values, isSubmitting, submitCount, isValid }) => {
            // Helper function to determine if we should show error
            const shouldShowError = (fieldName) => {
              const hasValue = values[fieldName] && values[fieldName].trim().length > 0;
              const hasError = errors[fieldName];
              const wasSubmitted = submitCount > 0;

              // Show validation errors immediately while typing if field has invalid content
              if (hasValue && hasError) {
                return true;
              }

              // Show required error only when submit was clicked AND field is empty
              if (wasSubmitted && !hasValue && hasError) {
                return true;
              }

              return false;
            };

            // Helper function to determine if field is valid
            const isFieldValid = (fieldName) => {
              const hasValue = values[fieldName] && values[fieldName].trim().length > 0;
              const hasError = errors[fieldName];
              const wasTouched = touched[fieldName];

              // Only show success checkmark after field was touched
              return wasTouched && hasValue && !hasError;
            };

            return (
              <Form className="space-y-7">
                {/* Name Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <label
                    htmlFor="name"
                    className="mb-3 block text-lg font-semibold text-emerald-900"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      Full Name
                    </div>
                  </label>
                  <div className="group relative">
                    <Field name="name">
                      {({ field }) => (
                        <input
                          {...field}
                          type="text"
                          id="name"
                          placeholder="John Doe"
                          disabled={submitLoading}
                          className={`w-full rounded-2xl border-2 px-5 py-4 text-base outline-none transition-all duration-300 ${
                            shouldShowError("name")
                              ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                              : isFieldValid("name")
                                ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 selection:bg-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                : "border-emerald-200/60 bg-white selection:bg-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          } ${submitLoading ? "cursor-not-allowed opacity-60" : ""}`}
                        />
                      )}
                    </Field>

                    {/* Success indicator */}
                    <AnimatePresence>
                      {isFieldValid("name") && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <Check className="h-5 w-5 text-emerald-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {shouldShowError("name") && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <label
                    htmlFor="email"
                    className="mb-3 block text-lg font-semibold text-emerald-900"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-emerald-600" />
                      Email Address
                    </div>
                  </label>
                  <div className="group relative">
                    <Field name="email">
                      {({ field }) => (
                        <input
                          {...field}
                          type="email"
                          id="email"
                          placeholder="your@email.com"
                          disabled={submitLoading}
                          className={`w-full rounded-2xl border-2 px-5 py-4 text-base outline-none transition-all duration-300 ${
                            shouldShowError("email")
                              ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                              : isFieldValid("email")
                                ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 selection:bg-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                : "border-emerald-200/60 bg-white selection:bg-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          } ${submitLoading ? "cursor-not-allowed opacity-60" : ""}`}
                        />
                      )}
                    </Field>

                    {/* Success indicator */}
                    <AnimatePresence>
                      {isFieldValid("email") && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <Check className="h-5 w-5 text-emerald-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {shouldShowError("email") && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.email}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Message Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <label
                    htmlFor="message"
                    className="mb-3 block text-lg font-semibold text-emerald-900"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                      Message
                    </div>
                  </label>
                  <div className="group relative">
                    <Field name="message">
                      {({ field }) => (
                        <textarea
                          {...field}
                          id="message"
                          placeholder="Tell us how we can help you..."
                          disabled={submitLoading}
                          rows="1"
                          onInput={(e) => {
                            // Auto-resize textarea
                            e.target.style.height = "auto";
                            e.target.style.height = Math.max(120, e.target.scrollHeight) + "px";
                          }}
                          className={`w-full resize-none overflow-hidden rounded-2xl border-2 px-5 py-4 text-base outline-none transition-all duration-300 ${
                            shouldShowError("message")
                              ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                              : isFieldValid("message")
                                ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 selection:bg-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                : "border-emerald-200/60 bg-white selection:bg-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          } ${submitLoading ? "cursor-not-allowed opacity-60" : ""}`}
                          style={{ minHeight: "120px" }}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mt-2 flex items-start justify-between">
                    {/* Error message */}
                    <AnimatePresence>
                      {shouldShowError("message") && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2 text-sm font-medium text-red-600"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.message}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Character counter */}
                    <motion.p
                      animate={{
                        color:
                          values.message.length > 900
                            ? "#dc2626"
                            : values.message.length > 700
                              ? "#f59e0b"
                              : "#10b981",
                      }}
                      className="ml-auto text-sm font-medium"
                    >
                      {values.message.length}/1000
                    </motion.p>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <motion.button
                    type="submit"
                    disabled={!isValid || isSubmitting || submitLoading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-8 py-5 text-lg font-semibold text-white shadow-xl shadow-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-xl"
                  >
                    {submitLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </motion.button>
                </motion.div>
              </Form>
            );
          }}
        </Formik>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-[28px] border-2 border-transparent bg-gradient-to-br from-emerald-400/0 to-teal-400/0 opacity-0 transition-all duration-300 group-hover:border-emerald-300/50 group-hover:from-emerald-400/5 group-hover:to-teal-400/5 group-hover:opacity-100" />
    </motion.div>
  );
};

export default ContactForm;
