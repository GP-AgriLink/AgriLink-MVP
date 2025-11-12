import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * New shared InputField for Auth components.
 * Maintains styling from the original login/register forms.
 */
const InputField = ({ label, type, name, placeholder, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="relative">
      <label htmlFor={name} className="inline text-sm font-semibold leading-5 text-[#064e3b]">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type={inputType}
          name={name}
          placeholder={placeholder}
          {...props}
          className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-5 text-[#022c22] transition-all placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-[rgba(167,243,208,0.7)] focus:ring-emerald-600"
          } ${isPassword ? "pr-10" : ""} `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 mt-2 flex items-center text-gray-400 hover:text-emerald-600"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
