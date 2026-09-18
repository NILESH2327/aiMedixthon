import { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Loader2, FileText, AlertTriangle, ClipboardList,
  ShieldAlert, ImageOff, X, Sparkles, ArrowUp, ArrowDown, CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { API_BASE } from "../../config";

const statusConfig = {
  Normal: { color: "from-emerald-400 to-green-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  "Mild Concern": { color: "from-amber-400 to-yellow-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  "Needs Attention": { color: "from-orange-400 to-red-500", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  Urgent: { color: "from-red-500 to-rose-600", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

const paramStatusStyle = {
  Normal: { badge: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, iconColor: "text-emerald-500" },
  Low: { badge: "bg-blue-100 text-blue-700", icon: ArrowDown, iconColor: "text-blue-500" },
  High: { badge: "bg-orange-100 text-orange-700", icon: ArrowUp, iconColor: "text-orange-500" },
  Attention: { badge: "bg-red-100 text-red-700", icon: AlertTriangle, iconColor: "text-red-500" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
};

const LabReportAnalyzer = () => {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
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
    if (!image) return alert("Report ki photo upload karo");
    setLoading(true); setResult(null); setRawError("");
    try {
      const token = await getToken();
      if (!token) {
        setRawError("Please sign in to analyze lab report.");
        return;
      }
      const activeUserId = userId || user?.id || "";
      const formData = new FormData();
      formData.append("image", image);
      if (activeUserId) {
        formData.append("userId", activeUserId);
        formData.append("clerkUserId", activeUserId);
      }

      const res = await axios.post(
        `${API_BASE}/api/ai/lab-report`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );

      const aiResponseText = res?.data?.data?.aiResponse;
      if (!res?.data?.success || !aiResponseText) {
        setRawError(res?.data?.message || "Unexpected response from server");
        return;
      }
      try {
        let parsed = aiResponseText;
        if (typeof parsed === "string") {
          const cleaned = parsed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          parsed = JSON.parse(cleaned);
        }
        setResult(parsed);
      } catch {
        setRawError("Could not parse AI response. Please try again.");
      }
    } catch (err) {
      setRawError(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const overall = result?.overallStatus ? statusConfig[result.overallStatus] : statusConfig.Normal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto mb-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>
      </div>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[380px_1fr] gap-8 items-start">

        {/* LEFT — Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-8 bg-white rounded-2xl shadow-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-md">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Lab Report Analyzer</h1>
              <p className="text-xs text-gray-400">Upload any medical report</p>
            </div>
          </div>

          {!preview ? (
            <label className="flex flex-col items-center gap-1.5 justify-center border-2 border-dashed border-violet-300 rounded-xl p-8 cursor-pointer hover:bg-violet-50 hover:border-violet-400 transition-all duration-300">
              <UploadCloud className="text-violet-500" size={22} />
              <span className="text-violet-600 text-xs font-medium text-center px-2">
                Blood test, sugar test, MRI, X-Ray — koi bhi report
              </span>
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative group">
              <img src={preview} alt="preview" className="rounded-xl max-h-48 object-cover w-full" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-400 to-purple-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Sparkles size={16} /> Analyze Report</>}
          </motion.button>
        </motion.div>

        {/* RIGHT — Output */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !rawError && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-24 text-gray-300">
                <FileText size={48} className="mb-3" />
                <p className="text-sm">Upload your report to get an easy explanation here</p>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-24 text-violet-400">
                <Loader2 className="animate-spin mb-3" size={36} />
                <p className="text-sm">Gemini is reading your report...</p>
              </motion.div>
            )}

            {rawError && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                ⚠️ {rawError}
              </motion.div>
            )}

            {result && !result.isValidInput && (
              <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center border border-orange-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-500 mb-4">
                  <ImageOff size={30} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">That doesn't look like a medical report</h3>
                <p className="text-gray-500 text-sm">{result.invalidReason}</p>
              </motion.div>
            )}

            {result && result.isValidInput && (
              <motion.div key="valid" className="space-y-5">

                {/* Header + overall status */}
                <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                  className={`rounded-2xl shadow-lg p-6 border ${overall.border} ${overall.bg} transition-shadow hover:shadow-xl`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">Report Type</p>
                      <h2 className="text-xl font-bold text-gray-800">{result.reportType}</h2>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${overall.color}`}>
                      {result.overallStatus}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{result.overallSummary}</p>
                </motion.div>

                {/* Parameters table */}
                {result.parameters?.length > 0 && (
                  <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="text-violet-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Values Explained</h3>
                    </div>
                    <div className="space-y-2.5">
                      {result.parameters.map((p, i) => {
                        const style = paramStatusStyle[p.status] || paramStatusStyle.Normal;
                        const Icon = style.icon;
                        return (
                          <motion.div key={i}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + i * 0.06 }}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-100 rounded-xl p-3.5 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2">
                                <Icon size={15} className={style.iconColor} />
                                <span className="font-medium text-gray-800 text-sm">{p.name}</span>
                              </div>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-1.5 pl-6">
                              <span>Value: <b className="text-gray-700">{p.value}</b></span>
                              {p.normalRange && p.normalRange !== "N/A" && (
                                <span>Normal: {p.normalRange}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 pl-6">{p.explanation}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* What it means */}
                {result.whatItMeans?.length > 0 && (
                  <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="text-purple-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Iska matlab kya hai</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {result.whatItMeans.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 bg-purple-50/60 rounded-xl p-3 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                          {m}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recommended Actions */}
                {result.recommendedActions?.length > 0 && (
                  <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="text-emerald-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Aage kya karein</h3>
                    </div>
                    <div className="space-y-2.5">
                      {result.recommendedActions.map((step, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="flex items-start gap-3 bg-emerald-50/60 rounded-xl p-3 hover:bg-emerald-50 transition-colors">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                          <p className="text-sm text-gray-700">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Urgent signs */}
                {result.urgentSigns?.length > 0 && (
                  <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-red-50 border border-red-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="text-red-500" size={20} />
                      <h3 className="font-semibold text-red-700">Turant doctor se milein agar</h3>
                    </div>
                    <div className="space-y-2">
                      {result.urgentSigns.map((sign, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-red-600">
                          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                          <span>{sign}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="bg-gray-800 text-white rounded-2xl p-5 flex items-start gap-3"
                >
                  <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Yaad rakhein:</span> {result.disclaimer || "Yeh sirf general knowledge ke liye hai, diagnosis nahi. Apni actual report ko doctor se hi interpret karwayein."}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LabReportAnalyzer;