import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, MessageCircle, Sparkles, Clock, Shield } from "lucide-react";

const AuthPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/register");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 pb-16 pt-8">
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-8 top-1/2 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

                {/* Close button - Fixed with proper event handling */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl"
                >
                  <MessageCircle className="h-10 w-10 text-emerald-600" />
                </motion.div>
              </div>

              {/* Content - with negative margin to overlap header */}
              <div className="relative -mt-8 rounded-t-3xl bg-white/90 px-6 pb-6 backdrop-blur-lg">
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-2 pt-4 text-center text-2xl font-bold text-gray-900"
                >
                  Join the Conversation!
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 text-center text-sm text-gray-600"
                >
                  Log in or create an account to chat with our AI assistant
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 space-y-3"
                >
                  {[
                    {
                      icon: Sparkles,
                      text: "24/7 AI assistance",
                      color: "from-purple-500 to-pink-500",
                    },
                    {
                      icon: Clock,
                      text: "Instant answers",
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      icon: Shield,
                      text: "Personalized support",
                      color: "from-emerald-500 to-teal-500",
                    },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 rounded-xl border border-emerald-100/50 bg-gradient-to-r from-gray-50/90 to-white/90 p-3 backdrop-blur-sm transition-all hover:border-emerald-200 hover:from-emerald-50/90 hover:to-teal-50/90 hover:shadow-md"
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${benefit.color} shadow-lg`}
                      >
                        <benefit.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {benefit.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogin();
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
                  >
                    Log In
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignup();
                    }}
                    className="w-full rounded-xl border-2 border-emerald-600 bg-white px-6 py-3.5 font-semibold text-emerald-700 transition-all hover:bg-emerald-50"
                  >
                    Join Us
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="w-full py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                  >
                    Maybe Later
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;
