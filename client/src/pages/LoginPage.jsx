import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/Auth/AuthLayout";
import LoginForm from "../components/Auth/LoginForm";

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them.
    // Farmers go to dashboard, customers go to discover.
    if (user) {
      const destination = user.role === "farmer" ? "/dashboard" : "/discover";
      navigate(destination, {
        replace: true,
      });
    }
  }, [user, navigate]);

  // Don't render the login form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
