import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Pill, FileText, MessageCircle, Sparkles, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const aiFeatures = [
  {
    id: "symptom-analyzer",
    title: "Symptom Analyzer",
    desc: "Upload symptoms or a photo and get instant AI insights.",
    icon: Stethoscope,
    path: "/ai-tools/symptom-analyzer",
    color: "from-teal-400 to-emerald-500",
  },
  {
    id: "medicine-scanner",
    title: "Medicine Scanner",
    desc: "Scan medicine strips/bottles to know usage & dosage.",
    icon: Pill,
    path: "/ai-tools/medicine-scanner",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "lab-report",
    title: "Lab Report Analyzer",
    desc: "Upload lab reports and get simplified explanations.",
    icon: FileText,
    path: "/ai-tools/lab-report",
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "assistant",
    title: "AI Health Assistant",
    desc: "Chat with an AI assistant for quick health guidance.",
    icon: MessageCircle,
    path: "/ai-tools/assistant",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "recommendations",
    title: "Smart Recommendations",
    desc: "Personalized health tips based on your profile.",
    icon: Sparkles,
    path: "/ai-tools/recommendations",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "history",
    title: "My AI History",
    desc: "View all your past AI interactions and reports in one place.",
    icon: Clock,
    path: "/ai-tools/history",
    color: "from-slate-500 to-gray-700",
  },
];

const Tools = () => {
  const navigate = useNavigate();

  return (
    <div>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">🤖 AI Features</h1>
        <p className="text-teal-500 mt-2">Powered by Google Gemini AI</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {aiFeatures.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => navigate(feature.path)}
              className="relative cursor-pointer rounded-2xl bg-white p-6 shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
            >
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-500`}
              />
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300`}
              >
                <Icon size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
              <div className="mt-4 text-teal-500 text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                Try now →
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    <Footer/>
    </div>
  );
};

export default Tools;