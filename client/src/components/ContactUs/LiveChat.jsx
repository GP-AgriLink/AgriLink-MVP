import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  Bot,
  User,
  ChevronDown,
  Sparkles,
  Plus,
} from "lucide-react";
import { sendChatMessage, getChatHistory, startNewConversation } from "../../services/chatService";
import { toast } from "react-toastify";

const LiveChat = forwardRef(({ onClose }, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory();
        
        if (history.length > 0) {
          // User has existing history
          setMessages(history);
        } else {
          // No history, show welcome message
          const welcomeMessage = {
            role: "ai",
            content:
              "👋 Hello! I'm your AgriLink AI Assistant. I'm here to help you with any questions about our platform, products, or how to connect with local farmers. How can I assist you today?",
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Still show welcome message on error
        const welcomeMessage = {
          role: "ai",
          content:
            "👋 Hello! I'm your AgriLink AI Assistant. I'm here to help you with any questions about our platform, products, or how to connect with local farmers. How can I assist you today?",
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    };

    loadHistory();
  }, []);

  // Auto-scroll to bottom - only within chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    // Only auto-scroll if there's more than just the welcome message
    // This prevents scrolling on initial mount
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Backend now manages conversation history
      const response = await sendChatMessage(userMessage.content);

      const aiMessage = {
        role: "ai",
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to send message. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle new conversation
  const handleNewConversation = async () => {
    try {
      await startNewConversation();
      
      // Clear current messages and show welcome message
      const welcomeMessage = {
        role: "ai",
        content:
          "👋 Hello! I'm your AgriLink AI Assistant. I'm here to help you with any questions about our platform, products, or how to connect with local farmers. How can I assist you today?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      
      toast.success("New conversation started! Previous messages deleted.", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("New conversation error:", error);
      toast.error("Failed to start new conversation", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="relative flex min-h-[650px] flex-col overflow-hidden rounded-[28px] border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-2xl shadow-emerald-500/20"
    >
      {/* Decorative gradient blurs - contained within bounds */}
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-gradient-to-tr from-teal-400/20 to-emerald-400/20 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-emerald-200/50 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              AgriLink AI Assistant
            </h3>
            <p className="text-xs text-white/80">Powered by AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* New Conversation Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewConversation}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
            title="Start new conversation"
          >
            <Plus className="h-5 w-5 text-white" />
          </motion.button>
          
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <X className="h-5 w-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="relative z-10 h-[400px] space-y-4 overflow-y-auto p-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#10b981 transparent",
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                x: message.role === "user" ? 50 : -50,
                scale: 0.8,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                } shadow-lg`}
              >
                {message.role === "user" ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex max-w-[75%] flex-col gap-1">
                <div
                  className={`rounded-2xl px-5 py-3 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                      : "border border-emerald-100 bg-white text-gray-800 backdrop-blur-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-[1.6] tracking-wide">
                    {message.content}
                  </p>
                </div>
                <span
                  className={`text-xs text-emerald-600/60 ${message.role === "user" ? "text-right" : ""}`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/80 px-5 py-3 shadow-md backdrop-blur-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0,
                  }}
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0.2,
                  }}
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0.4,
                  }}
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg hover:shadow-xl"
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative z-10 border-t border-emerald-200/50 bg-white/50 p-4 backdrop-blur-sm">
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows="1"
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(120, e.target.scrollHeight) + "px";
            }}
            className="flex-1 resize-none overflow-hidden rounded-2xl border-2 border-emerald-200/60 bg-white px-5 py-3 text-base outline-none transition-all duration-300 selection:bg-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default LiveChat;
