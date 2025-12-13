import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePassword } from "../../services/userService";
import { toast } from "react-toastify";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

const getDefaultErrors = () => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

export const ChangePassword = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState(getDefaultErrors());
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Reset form when modal closes
  const handleClose = useCallback(() => {
    // Clear all form data
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    // Clear all errors
    setFormErrors(getDefaultErrors());
    // Reset password visibility
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    // Call parent onClose
    onClose();
  }, [onClose]);

  const validateField = (name, value, allFormData = formData) => {
    let error = "";
    const trimmedValue = value?.trim();

    switch (name) {
      case "currentPassword":
        if (!trimmedValue) {
          error = "Current password is required";
        } else if (trimmedValue.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "newPassword":
        if (!trimmedValue) {
          error = "New password is required";
        } else if (trimmedValue.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (!PASSWORD_REGEX.test(trimmedValue)) {
          error =
            "Password must include uppercase, lowercase, number, and special character (@$!%*?&)";
        } else if (trimmedValue === allFormData.currentPassword?.trim()) {
          error = "New password must be different from current password";
        }
        break;
      case "confirmPassword":
        if (!trimmedValue) {
          error = "Please confirm your password";
        } else {
          // Check if new password has any validation errors
          const newPasswordError = validateField(
            "newPassword",
            allFormData.newPassword,
            allFormData
          );
          if (newPasswordError && trimmedValue === allFormData.newPassword) {
            error = newPasswordError;
          } else if (trimmedValue !== allFormData.newPassword) {
            error = "Passwords must match";
          }
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Validate the field with updated data
      const error = validateField(name, value, updatedData);
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

      // Re-validate new password if current password changes (to check if they match)
      if (name === "currentPassword" && updatedData.newPassword) {
        const newPasswordError = validateField("newPassword", updatedData.newPassword, updatedData);
        setFormErrors((prevErrors) => ({ ...prevErrors, newPassword: newPasswordError }));

        // Also re-validate confirm password since it depends on new password validity
        if (updatedData.confirmPassword) {
          const confirmError = validateField(
            "confirmPassword",
            updatedData.confirmPassword,
            updatedData
          );
          setFormErrors((prevErrors) => ({ ...prevErrors, confirmPassword: confirmError }));
        }
      }

      // Re-validate confirm password if new password changes
      if (name === "newPassword" && updatedData.confirmPassword) {
        const confirmError = validateField(
          "confirmPassword",
          updatedData.confirmPassword,
          updatedData
        );
        setFormErrors((prevErrors) => ({ ...prevErrors, confirmPassword: confirmError }));
      }

      return updatedData;
    });
  }, []);

  const isFormValid = useCallback(() => {
    const hasErrors = Object.values(formErrors).some((error) => error.length > 0);
    const isEmpty =
      !formData.currentPassword?.trim() ||
      !formData.newPassword?.trim() ||
      !formData.confirmPassword?.trim();
    return !hasErrors && !isEmpty;
  }, [formErrors, formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isFormValid()) {
        toast.error("Please fix all validation errors");
        return;
      }

      setIsLoading(true);
      try {
        await updatePassword(formData.currentPassword, formData.newPassword);
        toast.success("Password updated successfully!");

        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setFormErrors(getDefaultErrors());
        setShowPasswords({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        });

        handleClose();
      } catch (error) {
        console.error("Error updating password:", error);
        const errorMessage = error.response?.data?.message || "Failed to update password";
        toast.error(errorMessage);

        // If it's a current password error, show it on the field
        if (errorMessage.toLowerCase().includes("current password")) {
          setFormErrors((prev) => ({ ...prev, currentPassword: errorMessage }));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isFormValid, formData, onClose, handleClose]
  );

  const getInputClasses = (fieldName) => {
    const baseClasses =
      "w-full px-3 py-2 pr-10 text-sm border rounded-xl outline-none transition-all duration-200";
    const hasError = formErrors[fieldName];
    const isEmpty = !formData[fieldName]?.trim();
    const isValid = !hasError && !isEmpty;

    if (hasError) {
      return `${baseClasses} border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-400/20`;
    } else if (isValid) {
      return `${baseClasses} border-emerald-400 bg-emerald-50/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20`;
    } else {
      return `${baseClasses} border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20`;
    }
  };

  const ValidationStatus = ({ fieldName }) => {
    const error = formErrors[fieldName];
    const value = formData[fieldName]?.trim();
    if (error) {
      return (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
          {error}
        </p>
      );
    }
    if (!value) {
      return <p className="mt-1 text-[11px] text-gray-400">Required field</p>;
    }
    return (
      <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
        <span className="inline-block h-1 w-1 rounded-full bg-emerald-600"></span>Valid
      </p>
    );
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isLoading, handleClose]);

  // Framer Motion variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium Gradient Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 px-6 pb-5 pt-6">
              {/* Reduced shimmer effect - more subtle - does not block clicks */}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Removed pattern overlay for cleaner look */}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3.5">
                {/* Solid white icon badge for maximum clarity */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="relative flex-shrink-0"
                >
                  {/* Subtle glow */}
                  <div className="absolute inset-0 rounded-xl bg-white/20 blur-md"></div>

                  {/* Solid white icon container */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg">
                    <Shield className="h-7 w-7 text-emerald-600" />
                  </div>
                </motion.div>

                {/* Title and subtitle with improved shadows */}
                <div className="flex-1">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-xl font-bold leading-tight text-white"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                  >
                    Change Password
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-1 flex items-center gap-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white shadow-sm"></span>
                      <span
                        className="text-xs font-medium text-white"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                      >
                        Secure your account
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
              {/* Current Password */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  Current Password
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className={getInputClasses("currentPassword")}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                    tabIndex={-1}
                    aria-label={showPasswords.currentPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.currentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ValidationStatus fieldName="currentPassword" />
              </div>

              {/* New Password */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  New Password
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className={getInputClasses("newPassword")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                    tabIndex={-1}
                    aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ValidationStatus fieldName="newPassword" />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  Confirm Password
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className={getInputClasses("confirmPassword")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                    tabIndex={-1}
                    aria-label={showPasswords.confirmPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ValidationStatus fieldName="confirmPassword" />
              </div>

              {/* Submit Button */}
              <div className="flex gap-2.5 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>

            {/* Security note */}
            <div className="px-6 pb-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                <p className="flex items-start gap-2 text-[11px] text-emerald-700">
                  <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    Your password is encrypted and stored securely. We recommend using a strong,
                    unique password.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
