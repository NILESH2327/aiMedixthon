import { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Target, Activity, Flame, Shield, Heart,
  Coffee, Apple, Smile, ArrowRight, RotateCcw, AlertTriangle, ArrowLeft, Loader2, ListChecks,
  CalendarCheck,
} from "lucide-react";
import { API_BASE } from "../../config";

const goalOptions = [
  "Weight Loss", "Muscle Gain", "Better Sleep", "Stress Relief",
  "Heart Health", "High Energy", "Diabetes Care", "Immunity Boost",
];
const goalsList = goalOptions;

const iconMap = {
  diet: Apple, nutrition: Apple, exercise: Activity, workout: Flame,
  fitness: Flame, sleep: Coffee, stress: Smile, mental: Smile,
  general: Heart, routine: Target,
};

const getIcon = (title) => {
  const key = Object.keys(iconMap).find((k) => title.toLowerCase().includes(k.toLowerCase()));
  return iconMap[key] || Heart;
};

const Recommendations = () => {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [step, setStep] = useState(1); // 1 = form, 2 = result
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("");
  const [goals, setGoals] = useState([]);
  const [result, setResult] = useState(null);
  const [rawError, setRawError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleGoal = (g) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleSubmit = async () => {
    if (!gender || goals.length === 0) return alert("Gender aur kam se kam ek health goal select karo");
    setLoading(true); setRawError("");
    try {
      const token = await getToken();
      if (!token) {
        setRawError("Please sign in to get personalized recommendations.");
        return;
      }
      const activeUserId = userId || user?.id || "";
      const res = await axios.post(
        `${API_BASE}/api/ai/recommendations`,
        { age, gender, healthGoals: goals.join(", "), userId: activeUserId, clerkUserId: activeUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aiResponseText = res?.data?.data?.aiResponse;
      if (!res?.data?.success || !aiResponseText) {
        setRawError(res?.data?.message || "Unexpected response");
        return;
      }
      let parsed = aiResponseText;
      if (typeof parsed === "string") {
        const cleaned = parsed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        parsed = JSON.parse(cleaned);
      }
      setResult(parsed);
      setStep(2);
    } catch (err) {
      setRawError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(1); setResult(null); setGoals([]); setRawError(""); };

  const scoreColor = result?.wellnessScore >= 70 ? "from-emerald-400 to-green-500"
    : result?.wellnessScore >= 40 ? "from-amber-400 to-yellow-500"
    : "from-orange-400 to-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 px-4 sm:px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-xl mb-4">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>
      </div>
      <div className="w-full max-w-xl">

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-3 shadow-lg">
                  <Sparkles size={26} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Smart Recommendations</h1>
                <p className="text-gray-400 text-sm mt-1">Tell us about yourself for a personalized plan</p>
              </div>

              {/* Age slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <span className="text-sm font-bold text-orange-500">{age} years</span>
                </div>
                <input
                  type="range" min="10" max="90" value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        gender === g
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-md"
                          : "border-gray-200 text-gray-500 hover:border-orange-300"
                      }`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Health Goals (multiple choose kar sakte ho)</label>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((g) => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => toggleGoal(g)}
                      className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                        goals.includes(g)
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-sm"
                          : "border-gray-200 text-gray-500 hover:border-orange-300"
                      }`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
              </div>

              {rawError && (
                <p className="text-red-500 text-xs text-center mb-4">⚠️ {rawError}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3.5 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <><Loader2 className="animate-spin" size={18} /> Generating Plan...</> : <><Sparkles size={16} /> Get My Recommendations</>}
              </motion.button>
            </motion.div>
          )}

          {step === 2 && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {/* Score card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow"
              >
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-3">Your Wellness Score</p>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" strokeWidth="10" className="stroke-gray-100" fill="none" />
                    <motion.circle
                      cx="64" cy="64" r="56" strokeWidth="10" fill="none"
                      strokeLinecap="round"
                      className={`bg-gradient-to-r ${scoreColor}`}
                      stroke="url(#grad)"
                      strokeDasharray={2 * Math.PI * 56}
                      initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - result.wellnessScore / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{result.wellnessScore}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">{result.summary}</p>
              </motion.div>

              {/* Focus Areas */}
              {result.focusAreas?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="text-orange-500" size={20} />
                    <h3 className="font-semibold text-gray-800">Focus Areas</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.focusAreas.map((f, i) => {
                      const Icon = getIcon(f.title);
                      return (
                        <motion.div key={i}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.08 }}
                          whileHover={{ y: -3, scale: 1.02 }}
                          className="bg-amber-50 border border-amber-100 rounded-xl p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon size={16} className="text-orange-500" />
                            <span className="font-medium text-sm text-gray-800">{f.title}</span>
                          </div>
                          <p className="text-xs text-gray-500">{f.tip}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Daily habits */}
              {result.dailyHabits?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-amber-500" size={20} />
                    <h3 className="font-semibold text-gray-800">Daily Habits to Build</h3>
                  </div>
                  <div className="space-y-2">
                    {result.dailyHabits.map((h, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.06 }}
                        className="flex items-center gap-3 bg-orange-50/60 rounded-xl p-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-orange-400 text-white text-xs flex items-center justify-center font-bold shrink-0">✓</span>
                        {h}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Checkup schedule */}
              {result.checkupSchedule?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarCheck className="text-amber-600" size={20} />
                    <h3 className="font-semibold text-gray-800">Recommended Checkups</h3>
                  </div>
                  <div className="space-y-2">
                    {result.checkupSchedule.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-amber-50/60 rounded-xl p-3 text-sm">
                        <span className="text-gray-700 font-medium">{c.test}</span>
                        <span className="text-xs text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">{c.frequency}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="bg-gray-800 text-white rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                <p className="text-sm leading-relaxed">{result.disclaimer}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 text-sm text-orange-500 font-medium py-3 hover:bg-orange-50 rounded-xl transition-colors"
              >
                <RotateCcw size={14} /> Start Over
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Recommendations;