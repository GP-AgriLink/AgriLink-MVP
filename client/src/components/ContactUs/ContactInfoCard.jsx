import { motion } from "framer-motion";

const ContactInfoCard = ({ icon: Icon, title, description, linkText, linkHref, onClick, delay = 0 }) => {
  const isClickable = onClick || (linkText && linkHref);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-[28px] border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20"
    >
      {/* Decorative gradient blur */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-2xl transition-all duration-300 group-hover:scale-150" />

      <div className="relative z-10 flex items-start gap-5">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/60">
            <Icon className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <div className="flex-1">
          <h3 className="mb-2 text-2xl font-bold text-emerald-900 transition-colors duration-300 group-hover:text-emerald-600">
            {title}
          </h3>
          <p className="mb-4 text-base leading-relaxed text-emerald-700/80 transition-colors duration-300 group-hover:text-emerald-700">
            {description}
          </p>
          {isClickable && (
            <>
              {onClick ? (
                <motion.button
                  onClick={onClick}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="inline-flex items-center gap-2 font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  <span>{linkText}</span>
                  <motion.svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ x: 0 }}
                    whileHover={{ x: 3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </motion.svg>
                </motion.button>
              ) : (
                <motion.a
                  href={linkHref}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="inline-flex items-center gap-2 font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  <span>{linkText}</span>
                  <motion.svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ x: 0 }}
                    whileHover={{ x: 3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </motion.svg>
                </motion.a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-[28px] border-2 border-transparent bg-gradient-to-br from-emerald-400/0 to-teal-400/0 opacity-0 transition-all duration-300 group-hover:border-emerald-300/50 group-hover:from-emerald-400/5 group-hover:to-teal-400/5 group-hover:opacity-100" />
    </motion.div>
  );
};

export default ContactInfoCard;
