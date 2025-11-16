/**
 * Validation Schemas
 * Yup validation schemas for forms
 * * Import: import { loginValidationSchema } from '../utils/validationSchemas';
 */

import * as Yup from "yup";
import {
  sanitizeEmail,
  sanitizeName,
  sanitizeFarmName,
  sanitizePhone,
  sanitizeString,
  sanitizeTextArea,
} from "./sanitizers";
import { validateEgyptianPhone } from "./validators";

// --- Reusable Regex and Messages ---
// Added Arabic character range \u0621-\u064A
const nameRegex = /^[a-zA-Z\u0621-\u064A\s'-]+$/;
const nameInvalidCharsMessage = "Name can only contain letters, spaces, hyphens, and apostrophes";

// Farm name regex: letters, spaces, hyphens, periods, underscores allowed
const farmNameRegex = /^[a-zA-Z\u0621-\u064A\s'\-._ ]+$/;
const farmNameInvalidCharsMessage =
  "Farm name can only contain letters, spaces, hyphens, periods, underscores";

// Email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const trustedEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "zoho.com",
  "yandex.com",
  "live.com",
];

// Optional version for profile fields
const optionalNameRegex = /^[a-zA-Z\u0621-\u064A\s'-]*$/;

/**
 * Login validation schema
 */
export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .max(255, "Email exceeds maximum length")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password exceeds maximum length")
    .required("Password is required"),
});

/**
 * Registration validation schema
 */
export const registrationValidationSchema = (role) =>
  Yup.object({
    farmName: Yup.string().when([], {
      is: () => role === "farmer",
      then: (schema) =>
        schema
          .transform(sanitizeFarmName)
          .matches(farmNameRegex, farmNameInvalidCharsMessage)
          .min(3, "Farm name must be at least 3 characters")
          .max(100, "Farm name exceeds maximum length")
          .required("Farm name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    email: Yup.string()
      .transform(sanitizeEmail)
      .matches(emailRegex, "Please enter a valid email address")
      .test(
        "trusted-domain",
        "Please use a trusted email provider (Gmail, Yahoo, Outlook, etc.)",
        function (value) {
          if (!value) return true;
          const domain = value.toLowerCase().split("@")[1];
          return trustedEmailDomains.includes(domain);
        }
      )
      .max(255, "Email exceeds maximum length")
      .required("Email is required"),

    phoneNumber: Yup.string()
      .transform(sanitizePhone)
      .test(
        "is-egyptian-mobile",
        "Please enter a valid Egyptian mobile number (e.g., 01012345678, 01221234567)",
        (value) => !value || validateEgyptianPhone(value)
      )
      .required("Phone number is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password exceeds maximum length")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,
        "Password must include uppercase, lowercase, number, and special character (@$!%*?&)"
      )
      .required("Password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

/**
 * User Profile validation schema (for EditProfile page)
 * Validates the User model fields
 */
export const userProfileSchema = Yup.object({
  firstName: Yup.string()
    .transform(sanitizeName)
    .matches(optionalNameRegex, nameInvalidCharsMessage)
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name exceeds maximum length")
    .nullable(),
  lastName: Yup.string()
    .transform(sanitizeName)
    .matches(optionalNameRegex, nameInvalidCharsMessage)
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name exceeds maximum length")
    .nullable(),
  phoneNumber: Yup.string()
    .transform(sanitizePhone)
    .test(
      "is-egyptian-mobile",
      "Please enter a valid Egyptian mobile number (e.g., 01012345678, 01221234567)",
      (value) => !value || validateEgyptianPhone(value)
    )
    .required("Phone number is required"),
  avatarUrl: Yup.string().url("Must be a valid URL").nullable(),
});

/**
 * Farm Profile validation schema (for EditProfile page)
 * Validates the Farm model fields
 */
export const farmProfileSchema = Yup.object({
  farmName: Yup.string()
    .transform(sanitizeFarmName)
    .matches(farmNameRegex, farmNameInvalidCharsMessage)
    .min(3, "Farm name must be at least 3 characters")
    .max(100, "Farm name exceeds maximum length")
    .required("Farm name is required"),
  farmBio: Yup.string()
    .transform(sanitizeTextArea)
    .max(1000, "Bio exceeds maximum length (1000 characters)")
    .nullable(),
  specialties: Yup.array()
    .of(Yup.string().transform(sanitizeString))
    .max(3, "You can select up to 3 specialties only")
    .nullable(),
  location: Yup.object().shape({
    coordinates: Yup.array()
      .of(Yup.number())
      .min(2, "Coordinates must be [longitude, latitude]")
      .max(2, "Coordinates must be [longitude, latitude]"),
  }),
});

/**
 * Product validation schema
 */
export const productValidationSchema = Yup.object({
  name: Yup.string()
    .transform(sanitizeString)
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name exceeds maximum length (100 characters)")
    .matches(/^[A-Za-z0-9\s'-.,&()]+$/, "Product name contains invalid characters")
    .required("Product name is required"),
  price: Yup.number()
    .typeError("Price must be a valid number")
    .min(0.01, "Price must be at least $0.01")
    .max(999999.99, "Price exceeds maximum value")
    .test(
      "decimal-places",
      "Price can have at most 2 decimal places",
      (value) => !value || /^\d+(\.\d{1,2})?$/.test(value.toString())
    )
    .required("Price is required"),
  unit: Yup.string()
    .transform(sanitizeString)
    .required("Unit is required")
    .oneOf(["kg", "piece", "litre", "bundle", "unit"], "Invalid unit selected"),
  stock: Yup.number()
    .typeError("Stock must be a valid number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(999999, "Stock exceeds maximum value")
    .required("Stock quantity is required"),
  categories: Yup.array()
    .of(Yup.string().transform(sanitizeString))
    .min(1, "At least one category is required")
    .required("Categories are required"),
  description: Yup.string()
    .transform(sanitizeTextArea)
    .max(1000, "Description exceeds maximum length (1000 characters)")
    .nullable(),
  imageUrl: Yup.string()
    .transform(sanitizeString)
    .url("Must be a valid URL")
    .max(500, "Image URL exceeds maximum length")
    .nullable(),
});
