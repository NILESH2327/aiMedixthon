import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, AlertTriangle, ArrowLeft } from "lucide-react";
import { API_BASE } from "../../config";

const suggestedPrompts = [
  "I have a mild fever, what should I do?",
  "How much water should I drink daily?",
  "Tips for better sleep?",
  "Is it normal to feel dizzy after exercise?",
];

const HealthAssistant = () => {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm MediBot 👋 Ask me anything about your health, symptoms, or general wellness tips." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setInput("");
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        setMessages((prev) => [...prev, { role: "bot", text: "Please sign in to chat with MediBot.", isError: true }]);
        return;
      }
      const activeUserId = userId || user?.id || "";
      const res = await axios.post(
        `${API_BASE}/api/ai/assistant`,
        { message: messageText, userId: activeUserId, clerkUserId: activeUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reply = res?.data?.data?.aiResponse || "Sorry, I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: errMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl mb-4">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>
      </div>
      <div className="w-full max-w-2xl flex flex-col h-[82vh] bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-400 to-rose-500 text-white shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-semibold">MediBot</h1>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> AI Health Assistant
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white rounded-br-sm"
                    : msg.isError
                    ? "bg-red-50 text-red-600 border border-red-200 rounded-bl-sm"
                    : "bg-gray-100 text-gray-700 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggested prompts — only show at start */}
          {messages.length === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-2">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Sparkles size={12} /> Try asking</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((p, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(p)}
                    className="text-xs bg-pink-50 text-pink-600 border border-pink-200 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors"
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-pink-300 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your health question..."
              className="flex-1 bg-transparent outline-none text-sm px-3 py-1.5"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => sendMessage()}
              disabled={loading}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center shadow-md disabled:opacity-50 shrink-0"
            >
              <Send size={15} />
            </motion.button>
          </div>
          <p className="text-[10px] text-gray-300 text-center mt-2 flex items-center justify-center gap-1">
            <AlertTriangle size={10} /> Not a substitute for professional medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthAssistant;