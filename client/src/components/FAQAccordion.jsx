import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQAccordion = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="overflow-hidden rounded-[32px] border border-emerald-100/50 bg-white p-8 shadow-2xl shadow-emerald-500/10 md:p-10"
    >
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent"
      >
        Frequently Asked Questions
      </motion.h3>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="group overflow-hidden rounded-2xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50/50 to-white transition-all duration-300 hover:border-emerald-200 hover:shadow-lg"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="flex w-full items-center justify-between p-6 text-left transition-all duration-300"
            >
              <span className="pr-8 text-lg font-semibold text-emerald-900 transition-colors group-hover:text-emerald-600">
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-2 shadow-md transition-all duration-300 group-hover:shadow-lg">
                  <ChevronDown className="h-5 w-5 text-white" />
                </div>
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/30 px-6 pb-6 pt-4">
                    <motion.p
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-base leading-relaxed text-emerald-700/90"
                    >
                      {faq.answer}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FAQAccordion;
