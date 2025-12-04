import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Briefcase } from "lucide-react";
import AuthLayout from "../components/Auth/AuthLayout";
import Logo from "../components/common/Logo";
import RegisterForm from "../components/Auth/RegisterForm";

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("customer");

  useEffect(() => {
    if (user) {
      const destination = user.role === "farmer" ? "/dashboard" : "/";
      navigate(destination, { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="relative flex w-full max-w-[576px] flex-col items-center gap-1 rounded-[44px] border border-[rgba(167,243,208,0.7)] bg-white/95 p-8 text-[#064e3b] shadow-2xl">
        {/* Logo */}
        <div className="absolute -top-4 z-20 rounded-full bg-white p-2">
          <Logo />
        </div>

        {/* Header */}
        <div className="z-10 mt-8 flex w-full flex-col items-center gap-4 text-center">
          <span className="flex items-center rounded-full bg-[#ecfdf5] px-4 py-1 text-xs font-semibold uppercase tracking-[3.6px] text-[#047857]">
            Create Your Account
          </span>
          <h1 className="font-['Inter'] text-[30px] font-bold leading-9 tracking-[-0.6px] text-[#022c22]">
            Join AgriLink
          </h1>
          <p className="max-w-96 text-sm leading-5 text-[rgba(6,78,59,0.75)]">
            Sign up as a customer to discover local farms, or as a farmer to start selling.
          </p>
        </div>

        {/* --- Role Selector Buttons --- */}
        <div className="z-10 my-6 grid w-full max-w-sm grid-cols-2 gap-3">
          <RoleButton
            label="Customer"
            icon={<User className="h-5 w-5" />}
            isSelected={selectedRole === "customer"}
            onClick={() => setSelectedRole("customer")}
          />
          <RoleButton
            label="Farmer"
            icon={<Briefcase className="h-5 w-5" />}
            isSelected={selectedRole === "farmer"}
            onClick={() => setSelectedRole("farmer")}
          />
        </div>

        {/* --- Form Container --- */}
        <div className="relative h-auto w-full max-w-sm px-4">
          {/* Conditionally render only one form to avoid duplicate IDs */}
          {selectedRole === "customer" ? (
            <RegisterForm key="customer" role="customer" />
          ) : (
            <RegisterForm key="farmer" role="farmer" />
          )}
        </div>

        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[48px] bg-[radial-gradient(circle_at_center_top,rgba(35,97,69,0.15),rgba(0,0,0,0)_60%),radial-gradient(circle_at_center_bottom,rgba(52,120,88,0.12),rgba(0,0,0,0)_55%)]" />
      </div>
    </AuthLayout>
  );
};

// --- Reusable RoleButton Component ---
const RoleButton = ({ label, icon, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition-all duration-300 ${
        isSelected
          ? "border-transparent bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
          : "border-[rgba(167,243,208,0.7)] bg-white text-emerald-800 hover:bg-emerald-50"
      } `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default RegisterPage;
