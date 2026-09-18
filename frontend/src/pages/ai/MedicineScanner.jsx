import { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Loader2, Pill, AlertTriangle, ListChecks,
  Clock, ThumbsUp, XCircle, ShieldAlert, ImageOff, X, Sparkles,
  ArrowLeft,
} from "lucide-react";
import { API_BASE } from "../../config";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
};

const MedicineScanner = () => {
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
    if (!image) return alert("Medicine ki photo upload karo");
    setLoading(true); setResult(null); setRawError("");
    try {
      const token = await getToken();
      if (!token) {
        setRawError("Please sign in to scan medicine.");
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
        `${API_BASE}/api/ai/medicine-scanner`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );

      // Safe checks — backend response structure verify karo
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-blue-50 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto mb-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-cyan-600 transition-colors"
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
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-md">
              <Pill size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Medicine Scanner</h1>
              <p className="text-xs text-gray-400">Upload a medicine photo</p>
            </div>
          </div>

          {!preview ? (
            <label className="flex flex-col items-center gap-1.5 justify-center border-2 border-dashed border-cyan-300 rounded-xl p-8 cursor-pointer hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300">
              <UploadCloud className="text-cyan-500" size={22} />
              <span className="text-cyan-600 text-xs font-medium">Upload medicine strip / bottle</span>
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
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Scanning...</> : <><Sparkles size={16} /> Scan Medicine</>}
          </motion.button>
        </motion.div>

        {/* RIGHT — Output */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !rawError && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-24 text-gray-300">
                <Pill size={48} className="mb-3" />
                <p className="text-sm">Upload a medicine photo to see details here</p>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-24 text-cyan-400">
                <Loader2 className="animate-spin mb-3" size={36} />
                <p className="text-sm">Gemini is identifying the medicine...</p>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">That doesn't look like a medicine</h3>
                <p className="text-gray-500 text-sm">{result.invalidReason}</p>
              </motion.div>
            )}

            {result && result.isValidInput && (
              <motion.div key="valid" className="space-y-5">

                {/* Header */}
                <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                  className="rounded-2xl shadow-lg p-6 border border-cyan-200 bg-cyan-50 transition-shadow hover:shadow-xl">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">Identified Medicine</p>
                      <h2 className="text-xl font-bold text-gray-800">{result.medicineName}</h2>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-cyan-400 to-blue-500">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{result.summary}</p>
                </motion.div>

                {/* Used For */}
                {result.usedFor?.length > 0 && (
                  <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <ListChecks className="text-blue-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Kis problem mein kaam aata hai</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {result.usedFor.map((use, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="flex items-start gap-2 bg-blue-50/60 rounded-xl p-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {use}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* When to Take */}
                {result.whenToTake && (
                  <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="text-cyan-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Kab aur kaise khani chahiye</h3>
                    </div>
                    <p className="text-sm text-gray-600 bg-cyan-50/60 rounded-xl p-3">{result.whenToTake}</p>
                  </motion.div>
                )}

                {/* Benefits */}
                {result.benefits?.length > 0 && (
                  <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsUp className="text-emerald-500" size={20} />
                      <h3 className="font-semibold text-gray-800">Kitni helpful hai</h3>
                    </div>
                    <div className="space-y-2">
                      {result.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-emerald-50/60 rounded-xl p-3">
                          <ThumbsUp size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* When NOT to take */}
                {result.whenNotToTake?.length > 0 && (
                  <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-orange-50 border border-orange-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="text-orange-500" size={20} />
                      <h3 className="font-semibold text-orange-700">Kab nahi khani chahiye</h3>
                    </div>
                    <div className="space-y-2">
                      {result.whenNotToTake.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-orange-700">
                          <XCircle size={15} className="mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Side effects / Nuksan */}
                {result.sideEffects?.length > 0 && (
                  <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -3 }}
                    className="bg-red-50 border border-red-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="text-red-500" size={20} />
                      <h3 className="font-semibold text-red-700">Side Effects / Nuksan (agar misuse ho)</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.sideEffects.map((effect, i) => (
                        <motion.span key={i} whileHover={{ scale: 1.05 }}
                          className="text-xs font-medium bg-red-100 border border-red-200 text-red-700 px-3 py-1.5 rounded-full">
                          {effect}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Final disclaimer — bold, standout */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="bg-gray-800 text-white rounded-2xl p-5 flex items-start gap-3"
                >
                  <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Yaad rakhein:</span> {result.disclaimer || "Yeh sirf general knowledge ke liye hai, prescription nahi. Koi bhi dawa lene se pehle doctor ya pharmacist ki salah zaroor lein."}
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

export default MedicineScanner;