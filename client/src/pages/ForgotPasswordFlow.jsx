import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordStep from "../components/ForgetPassword/ForgotPasswordStep";
import CheckEmailStep from "../components/ForgetPassword/CheckEmailStep";
import { sanitizeEmail } from "../utils/sanitizers";

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

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

  const handleSendEmail = async (userEmail) => {
    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeEmail(userEmail);

      if (!sanitizedEmail) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      await axios.post(`${API_URL}/api/users/forgot-password`, {
        email: sanitizedEmail,
      });

      setEmail(sanitizedEmail);
      setStep(2);

      toast.info("If this email is registered, you will receive a password reset link", {
        position: "top-right",
        autoClose: 4000,
      });
    } catch (err) {
      setEmail(sanitizeEmail(userEmail));
      setStep(2);

      toast.info("If this email is registered, you will receive a password reset link", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/users/forgot-password`, {
        email,
      });

      toast.info("If this email is registered, you will receive a password reset link", {
        position: "top-right",
        autoClose: 4000,
      });
    } catch (err) {
      toast.info("If this email is registered, you will receive a password reset link", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <>
      {step === 1 && (
        <ForgotPasswordStep
          onNext={handleSendEmail}
          isLoading={isLoading}
          onBackToLogin={handleBackToLogin}
        />
      )}
      {step === 2 && (
        <CheckEmailStep
          email={email}
          onResend={handleResend}
          onBackToLogin={handleBackToLogin}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
