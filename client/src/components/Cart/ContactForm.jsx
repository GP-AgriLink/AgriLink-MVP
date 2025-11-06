import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { sanitizeName, sanitizePhone } from '../../utils/sanitizers';
import { validateEgyptianPhone } from '../../utils/validators';

// Validation Schema
const contactValidationSchema = Yup.object({
  fullName: Yup.string()
    .transform(sanitizeName)
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name exceeds maximum length')
    .matches(
      /^[a-zA-Z\u0621-\u064A\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .required('Full name is required'),
  phoneNumber: Yup.string()
    .transform(sanitizePhone)
    .test(
      'is-egyptian-mobile',
      'Please enter a valid Egyptian mobile number (e.g., 01012345678)',
      (value) => !value || validateEgyptianPhone(value)
    )
    .required('Phone number is required'),
});

const ContactForm = ({
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  onSubmit,
  loading,
  disabled,
}) => {
  return (
    <div className="sticky top-4 h-fit rounded-[24px] border border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-2xl font-bold text-[#1f2937]">Contact Information</h2>
      <p className="mb-6 text-sm font-light text-emerald-700">
        We will reach out to confirm delivery details and timing.
      </p>{' '}
      {disabled && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-700">Farmers cannot place orders.</p>
          <p className="mt-1 text-xs text-red-600">Please log out to continue as a customer.</p>
        </div>
      )}
      <Formik
        enableReinitialize
        initialValues={{
          fullName: fullName,
          phoneNumber: phoneNumber,
        }}
        validationSchema={contactValidationSchema}
        onSubmit={(values) => {
          setFullName(values.fullName);
          setPhoneNumber(values.phoneNumber);
          onSubmit({ preventDefault: () => {} });
        }}
      >
        {({ errors, touched, handleChange, handleBlur, values }) => (
          <Form className="space-y-5">
            {/* Full Name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f2937]">Full Name</label>
              <Field
                type="text"
                name="fullName"
                placeholder="your name"
                disabled={loading || disabled}
                onChange={(e) => {
                  handleChange(e);
                  setFullName(e.target.value);
                }}
                onBlur={handleBlur}
                className={`w-full rounded-[10px] border px-4 py-3.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.fullName && touched.fullName
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gray-200 bg-[#f9fafb]'
                } ${loading || disabled ? 'cursor-not-allowed bg-gray-100 opacity-60' : ''}`}
              />
              <ErrorMessage
                name="fullName"
                component="p"
                className="mt-2 text-xs font-medium text-red-600"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f2937]">
                Phone Number
              </label>
              <Field
                type="tel"
                name="phoneNumber"
                placeholder="01234567890"
                disabled={loading || disabled}
                onChange={(e) => {
                  handleChange(e);
                  setPhoneNumber(e.target.value);
                }}
                onBlur={handleBlur}
                className={`w-full rounded-[10px] border px-4 py-3.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gray-200 bg-[#f9fafb]'
                } ${loading || disabled ? 'cursor-not-allowed bg-gray-100 opacity-60' : ''}`}
              />
              <ErrorMessage
                name="phoneNumber"
                component="p"
                className="mt-2 text-xs font-medium text-red-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || disabled}
              className="mt-7 w-full rounded-[12px] bg-[#10b981] py-3.5 font-semibold text-white transition-all hover:bg-[#0e9f6e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#10b981]"
            >
              {loading ? 'Confirming...' : 'Confirm Order (Pay on Delivery)'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ContactForm;
