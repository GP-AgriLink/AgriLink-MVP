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
    .matches(/^[a-zA-Z\u0621-\u064A\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .required('Full name is required'),
  phoneNumber: Yup.string()
    .transform(sanitizePhone)
    .test('is-egyptian-mobile', 'Please enter a valid Egyptian mobile number (e.g., 01012345678)',
      value => !value || validateEgyptianPhone(value)
    )
    .required('Phone number is required'),
});

const ContactForm = ({ fullName, setFullName, phoneNumber, setPhoneNumber, onSubmit, loading, disabled }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-fit">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
        Contact Information
      </h2>

      <p className="text-emerald-800 text-sm mb-6">
        We will reach out to confirm delivery details and timing.
      </p>

      {disabled && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm font-medium text-red-700">
            Farmers cannot place orders.
          </p>
          <p className="text-xs text-red-600 mt-1">
            Please log out to continue as a customer.
          </p>
        </div>
      )}

      <Formik
        enableReinitialize
        initialValues={{ 
          fullName: fullName, 
          phoneNumber: phoneNumber 
        }}
        validationSchema={contactValidationSchema}
        onSubmit={(values) => {
          // Update parent state
          setFullName(values.fullName);
          setPhoneNumber(values.phoneNumber);
          // Call the submit handler
          onSubmit({ preventDefault: () => {} });
        }}
      >
        {({ errors, touched, handleChange, handleBlur, values }) => (
          <Form className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Full Name
              </label>
              <Field
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                disabled={loading || disabled}
                onChange={(e) => {
                  handleChange(e);
                  setFullName(e.target.value);
                }}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition ${
                  errors.fullName && touched.fullName
                    ? 'border-red-400'
                    : 'border-gray-300'
                } ${loading || disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <ErrorMessage
                name="fullName"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Phone Number
              </label>
              <Field
                type="tel"
                name="phoneNumber"
                placeholder="01012345678"
                disabled={loading || disabled}
                onChange={(e) => {
                  handleChange(e);
                  setPhoneNumber(e.target.value);
                }}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-400'
                    : 'border-gray-300'
                } ${loading || disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <ErrorMessage
                name="phoneNumber"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || disabled}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
