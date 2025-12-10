import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import ContactForm from "../components/ContactForm";
import ContactInfoCard from "../components/ContactInfoCard";
import FAQAccordion from "../components/FAQAccordion";

const ContactUs = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "We'll respond within 24 hours",
      linkText: "agrilink.corp@gmail.com",
      linkHref: "mailto:agrilink.corp@gmail.com",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our AI assistant for instant help",
      linkText: "Start a conversation",
      linkHref: "#",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "AgriLink Online Platform",
      linkText: null,
      linkHref: null,
    },
  ];

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer:
        "Currently, we accept cash on delivery (COD) for all orders. We're working on adding more payment options including credit/debit cards and mobile payments in the near future.",
    },
    {
      question: "How do I place an order?",
      answer:
        "Browse our marketplace to find fresh products from local farmers. Add items to your cart, proceed to checkout, and arrange pickup with the farmer.",
    },
    {
      question: "What are your customer support hours?",
      answer:
        "Live chat is available 24/7. For other queries, please email us at agrilink.corp@gmail.com.",
    },
    {
      question: "How fresh are the products?",
      answer: "All products on AgriLink come directly from local farmers.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-teal-50/20">
      {/* Decorative background elements */}
      <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-tl from-emerald-400/10 to-teal-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full px-4 py-8 md:px-6 md:py-12 lg:w-5/6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4 inline-block rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-2"
          >
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-sm font-semibold uppercase tracking-wide text-transparent">
              Contact Us
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-700 bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
          >
            Get In Touch With Us
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto max-w-2xl text-xl leading-relaxed text-emerald-700/80"
          >
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          {/* Contact Form */}
          <ContactForm />

          {/* Contact Information Section */}
          <div className="space-y-8">
            {/* Contact Info Cards */}
            {contactInfo.map((info, index) => (
              <ContactInfoCard
                key={index}
                icon={info.icon}
                title={info.title}
                description={info.description}
                linkText={info.linkText}
                linkHref={info.linkHref}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* FAQ Accordion - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-20"
        >
          <FAQAccordion faqs={faqs} />
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;
