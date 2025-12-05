import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { sanitizeName, sanitizeEmail, sanitizeTextArea } from '../utils/sanitizers';
import { Mail, User, MessageSquare, CheckCircle } from 'lucide-react';

// Validation Schema for Contact Us Form
const contactUsValidationSchema = Yup.object({
  name: Yup.string()
    .transform(sanitizeName)
    .matches(
      /^[a-zA-Z\u0621-\u064A\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name exceeds maximum length')
    .required('Name is required'),
  email: Yup.string()
    .transform(sanitizeEmail)
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address with @ symbol'
    )
    .max(255, 'Email exceeds maximum length')
    .required('Email is required'),
  message: Yup.string()
    .transform(sanitizeTextArea)
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message exceeds maximum length')
    .required('Message is required'),
});

const ContactUs = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setSubmitLoading(true);
      // TODO: Connect to backend API
      console.log('Contact form submitted:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      resetForm();
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-teal-50/20">
        <div className="w-full lg:w-5/6 mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
              Get In Touch With Us
            </h1>
            <p className="text-xl text-emerald-700/70 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white rounded-[24px] border border-emerald-100/50 shadow-lg p-8 md:p-10">
              <h2 className="text-3xl font-bold text-emerald-900 mb-2">Send us a Message</h2>
              <p className="text-emerald-700/60 text-base mb-8">
                Fill out the form below and we'll get back to you shortly.
              </p>

              {submitSuccess && (
                <div className="mb-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-900">Message sent successfully!</p>
                    <p className="text-sm text-emerald-700/70">Thank you for contacting us. We'll be in touch soon.</p>
                  </div>
                </div>
              )}

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  message: '',
                }}
                validationSchema={contactUsValidationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, isSubmitting }) => (
                  <Form className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-lg font-semibold text-emerald-900 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600" />
                          Full Name
                        </div>
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        disabled={submitLoading}
                        className={`w-full rounded-[12px] border px-4 py-3 text-base outline-none transition-all focus:ring-2 ${
                          errors.name && touched.name
                            ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-200'
                            : 'border-emerald-200/60 bg-emerald-50/40 focus:border-emerald-500 focus:ring-emerald-500/20'
                        } ${submitLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                      {errors.name && touched.name && (
                        <div className="mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18.121 5.121a3 3 0 00-4.242 0L10 8.879l-3.879-3.879a3 3 0 00-4.242 4.242L5.879 13l-3.879 3.879a3 3 0 104.242 4.242L10 17.121l3.879 3.879a3 3 0 004.242-4.242L14.121 13l3.879-3.879a3 3 0 000-4.242z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs font-medium text-red-600">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-lg font-semibold text-emerald-900 mb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-600" />
                          Email Address
                        </div>
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your@email.com"
                        disabled={submitLoading}
                        className={`w-full rounded-[12px] border px-4 py-3 text-base outline-none transition-all focus:ring-2 ${
                          errors.email && touched.email
                            ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-200'
                            : 'border-emerald-200/60 bg-emerald-50/40 focus:border-emerald-500 focus:ring-emerald-500/20'
                        } ${submitLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                      {errors.email && touched.email && (
                        <div className="mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18.121 5.121a3 3 0 00-4.242 0L10 8.879l-3.879-3.879a3 3 0 00-4.242 4.242L5.879 13l-3.879 3.879a3 3 0 104.242 4.242L10 17.121l3.879 3.879a3 3 0 004.242-4.242L14.121 13l3.879-3.879a3 3 0 000-4.242z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs font-medium text-red-600">{errors.email}</p>
                        </div>
                      )}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label htmlFor="message" className="block text-base font-semibold text-emerald-900 mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          Message
                        </div>
                      </label>
                      <Field
                        as="textarea"
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        disabled={submitLoading}
                        rows="5"
                        className={`w-full rounded-[12px] border px-4 py-3 text-base outline-none transition-all resize-none focus:ring-2 ${
                          errors.message && touched.message
                            ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-200'
                            : 'border-emerald-200/60 bg-emerald-50/40 focus:border-emerald-500 focus:ring-emerald-500/20'
                        } ${submitLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                      <div className="mt-1 flex justify-between items-start">
                        {errors.message && touched.message && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.121 5.121a3 3 0 00-4.242 0L10 8.879l-3.879-3.879a3 3 0 00-4.242 4.242L5.879 13l-3.879 3.879a3 3 0 104.242 4.242L10 17.121l3.879 3.879a3 3 0 004.242-4.242L14.121 13l3.879-3.879a3 3 0 000-4.242z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-medium text-red-600">{errors.message}</p>
                          </div>
                        )}
                        <p className="text-sm text-emerald-600/60">{values.message.length}/1000</p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || submitLoading}
                      className="w-full mt-8 rounded-[12px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/60 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                    >
                      {submitLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-8">
              {/* Info Card 1 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[24px] border border-emerald-200/50 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Email Us</h3>
                    <p className="text-emerald-700/70 text-base mb-3">We'll respond within 24 hours</p>
                    <a href="mailto:support@agrilink.com" className="inline-block text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                      support@agrilink.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Info Card 2 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[24px] border border-emerald-200/50 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Live Chat</h3>
                    <p className="text-emerald-700/70 text-base mb-3">Join our community for quick support</p>
                    <a href="#" className="inline-block text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                      Start a conversation
                    </a>
                  </div>
                </div>
              </div>

              {/* Info Card 3 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[24px] border border-emerald-200/50 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Visit Us</h3>
                    <p className="text-emerald-700/70 text-base">
                      AgriLink Headquarters<br />
                      Cairo, Egypt
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Accordion (replaced static list with accessible details/summary) */}
              <div className="bg-white rounded-[24px] border border-emerald-100/50 shadow-lg p-6 md:p-8">
                <h3 className="text-2xl font-bold text-emerald-900 mb-4">Frequently Asked Questions</h3>

                <div className="space-y-3">
                  <details className="group rounded-lg border border-emerald-100/40 p-4 bg-emerald-50/30">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-base font-medium text-emerald-900">How long does delivery take?</span>
                      <span className="ml-4 text-emerald-600 transform transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-base text-emerald-700/80">
                      Deliveries typically arrive within 2–5 business days depending on your location and chosen shipping option.
                    </p>
                  </details>

                  <details className="group rounded-lg border border-emerald-100/40 p-4 bg-emerald-50/30">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-base font-medium text-emerald-900">What payment methods do you accept?</span>
                      <span className="ml-4 text-emerald-600 transform transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-base text-emerald-700/80">
                      We accept credit/debit cards, mobile payments, and cash on delivery in supported areas.
                    </p>
                  </details>

                  <details className="group rounded-lg border border-emerald-100/40 p-4 bg-emerald-50/30">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-base font-medium text-emerald-900">Can I track my order?</span>
                      <span className="ml-4 text-emerald-600 transform transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-base text-emerald-700/80">
                      Yes — after your order ships we'll send an email with a tracking link so you can follow delivery progress.
                    </p>
                  </details>

                  <details className="group rounded-lg border border-emerald-100/40 p-4 bg-emerald-50/30">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-base font-medium text-emerald-900">How do I become a farmer partner?</span>
                      <span className="ml-4 text-emerald-600 transform transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-base text-emerald-700/80">
                      Visit our Farmers page to learn about partnership requirements and submit an application. We review submissions weekly.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ContactUs;