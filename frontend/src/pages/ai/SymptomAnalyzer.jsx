import { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Loader2, Stethoscope, AlertTriangle,
  CheckCircle2, Lightbulb, HelpCircle, ShieldAlert, ImageOff, X, Sparkles,
  ArrowLeft,
} from "lucide-react";
import { API_BASE } from "../../config";

const severityConfig = {
  Mild: { color: "from-emerald-400 to-green-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  Moderate: { color: "from-amber-400 to-yellow-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  Severe: { color: "from-orange-400 to-red-500", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  Emergency: { color: "from-red-500 to-rose-600", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
};

const SymptomAnalyzer = () => {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [rawError, setRawError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };
  const removeImage = () => { setImage(null); setPreview(null); };

  const handleSubmit = async () => {
    if (!symptoms && !image) return alert("Symptoms likho ya image upload karo");
    setLoading(true); setResult(null); setRawError("");
    try {
      const token = await getToken();
      if (!token) {
        setRawError("Please sign in to analyze your symptoms.");
        return;
      }
      const activeUserId = userId || user?.id || "";
      const formData = new FormData();
      formData.append("symptoms", symptoms);
      if (image) formData.append("image", image);
      if (activeUserId) {
        formData.append("userId", activeUserId);
        formData.append("clerkUserId", activeUserId);
      }

      const { data } = await axios.post(
        `${API_BASE}/api/ai/symptom-analyzer`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );

      const aiText = data?.data?.aiResponse;
      try {
        let parsed = aiText;
        if (typeof parsed === "string") {
          const cleaned = parsed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          parsed = JSON.parse(cleaned);
        }
        setResult(parsed);
      } catch {
        setRawError(aiText || "Could not parse AI response.");
      }
    } catch (err) {
      setRawError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const sev = result?.severity?.level ? severityConfig[result.severity.level] : severityConfig.Mild;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto mb-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>
      </div>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[380px_1fr] gap-8 items-start">

        {/* LEFT — Input Panel (sticky) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-8 bg-white rounded-2xl shadow-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Symptom Analyzer</h1>
              <p className="text-xs text-gray-400">Describe or upload a photo</p>
            </div>
          </div>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. fever, headache, sore throat since 2 days..."
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-400 outline-none resize-none h-32 text-sm transition-shadow"
          />

          {!preview ? (
            <label className="flex flex-col items-center gap-1.5 justify-center border-2 border-dashed border-teal-300 rounded-xl p-5 cursor-pointer hover:bg-teal-50 hover:border-teal-400 transition-all duration-300">
              <UploadCloud className="text-teal-500" size={20} />
              <span className="text-teal-600 text-xs font-medium">Upload photo (optional)</span>
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative group">
              <img src={preview} alt="preview" className="rounded-xl max-h-40 object-cover w-full" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Sparkles size={16} /> Analyze Symptoms</>}
          </motion.button>
        </motion.div>

        {/* RIGHT — Output */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !rawError && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-24 text-gray-300"
              >
                <Stethoscope size={48} className="mb-3" />
                <p className="text-sm">Fill the form on the left to get your AI analysis here</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-24 text-teal-400"
              >
                <Loader2 className="animate-spin mb-3" size={36} />
                <p className="text-sm">Gemini is analyzing your symptoms...</p>
              </motion.div>
            )}

            {rawError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm"
              >
                {rawError}
              </motion.div>
            )}

            {result && !result.isValidInput && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center border border-orange-100"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-500 mb-4">
                  <ImageOff size={30} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">That doesn't look like a symptom</h3>
                <p className="text-gray-500 text-sm">{result.invalidReason}</p>
              </motion.div>
            )}

            {result && result.isValidInput && (
              <motion.div key="valid" className="space-y-5">
                <motion.div
                  custom={0} variants={cardVariants} initial="hidden" animate="visible"
                  whileHover={{ y: -3 }}
                  className={`rounded-2xl shadow-lg p-6 border ${sev.border} ${sev.bg} transition-shadow hover:shadow-xl`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">Possible Condition</p>
                      <h2 className="text-xl font-bold text-gray-800">{result.condition}</h2>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${sev.color}`}>
                      {result.severity?.level}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{result.summary}</p>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Severity Score</span>
                      <span className={`font-semibold ${sev.text}`}>{result.severity?.score}/10</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(result.severity?.score || 0) * 10}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${sev.color}`}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  custom={1} variants={cardVariants} initial="hidden" animate="visible"
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="text-teal-500" size={20} />
                    <h3 className="font-semibold text-gray-800">What you can do right now</h3>
                  </div>
                  <div className="space-y-2.5">
                    {result.steps?.map((step, i) => (
                      <motion.div
                        key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-start gap-3 bg-teal-50/60 rounded-xl p-3 hover:bg-teal-50 transition-colors"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="text-sm text-gray-700">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {result.tips?.length > 0 && (
                  <motion.div
                    custom={2} variants={cardVariants} initial="hidden" animate="visible"
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="text-amber-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Helpful Tips</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {result.tips.map((tip, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.03 }} className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-gray-700">
                          {tip}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {result.seekDoctorIf?.length > 0 && (
                  <motion.div
                    custom={3} variants={cardVariants} initial="hidden" animate="visible"
                    whileHover={{ y: -3 }}
                    className="bg-red-50 border border-red-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="text-red-500" size={20} />
                      <h3 className="font-semibold text-red-700">See a doctor immediately if you notice</h3>
                    </div>
                    <div className="space-y-2">
                      {result.seekDoctorIf.map((sign, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-red-600">
                          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                          <span>{sign}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="text-xs text-gray-400 text-center pt-2"
                >
                  {result.disclaimer}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SymptomAnalyzer;