import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Stethoscope, Pill, FileText, MessageCircle, Sparkles,
  Clock, X, ImageIcon, Inbox, Trash2, ArrowLeft,
} from "lucide-react";
import { API_BASE } from "../../config";

const typeConfig = {
  symptom: { label: "Symptom Analyzer", icon: Stethoscope, color: "from-teal-400 to-emerald-500", bg: "bg-teal-50", text: "text-teal-600" },
  medicine: { label: "Medicine Scanner", icon: Pill, color: "from-cyan-400 to-blue-500", bg: "bg-cyan-50", text: "text-cyan-600" },
  labReport: { label: "Lab Report", icon: FileText, color: "from-violet-400 to-purple-500", bg: "bg-violet-50", text: "text-violet-600" },
  assistant: { label: "Health Assistant", icon: MessageCircle, color: "from-pink-400 to-rose-500", bg: "bg-pink-50", text: "text-pink-600" },
  recommendation: { label: "Recommendations", icon: Sparkles, color: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600" },
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "symptom", label: "Symptoms" },
  { key: "medicine", label: "Medicines" },
  { key: "labReport", label: "Lab Reports" },
  { key: "assistant", label: "Chats" },
  { key: "recommendation", label: "Plans" },
];

const parseAiJson = (text) => {
  if (!text) return null;
  if (typeof text === "object") return text;
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// try to extract a short headline + status text depending on type
const getCardMeta = (item) => {
  if (item.type === "assistant") {
    return { title: item.inputText || "Health question", sub: item.aiResponse?.slice(0, 90) + "..." };
  }
  try {
    const parsed = parseAiJson(item.aiResponse);
    if (!parsed) return { title: "Analysis", sub: item.aiResponse?.slice(0, 90) + "..." };
    if (!parsed.isValidInput && parsed.invalidReason) {
      return { title: "Invalid input", sub: parsed.invalidReason, invalid: true };
    }
    switch (item.type) {
      case "symptom":
        return { title: parsed.condition || "Symptom check", sub: parsed.summary, badge: parsed.severity?.level };
      case "medicine":
        return { title: parsed.medicineName || "Medicine scan", sub: parsed.summary, badge: parsed.category };
      case "labReport":
        return { title: parsed.reportType || "Lab report", sub: parsed.overallSummary, badge: parsed.overallStatus };
      case "recommendation":
        return { title: `Wellness Score: ${parsed.wellnessScore}/100`, sub: parsed.summary };
      default:
        return { title: "Analysis", sub: "" };
    }
  } catch {
    return { title: "Analysis", sub: item.aiResponse?.slice(0, 90) + "..." };
  }
};
const DetailContent = ({ item }) => {
  if (item.type === "assistant") {
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {item.aiResponse}
      </p>
    );
  }

  const parsed = parseAiJson(item.aiResponse);
  if (!parsed) {
    return <p className="text-sm text-gray-700 whitespace-pre-line">{item.aiResponse}</p>;
  }

  if (parsed.isValidInput === false) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-700 font-medium mb-1">Invalid input</p>
        <p className="text-gray-400 text-sm">{parsed.invalidReason}</p>
      </div>
    );
  }

  if (item.type === "symptom") {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Condition</p>
          <p className="font-semibold text-gray-800">{parsed.condition}</p>
          <p className="text-sm text-gray-600 mt-1">{parsed.summary}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-teal-50 text-teal-600 px-3 py-1 rounded-full font-medium">
            {parsed.severity?.level} · {parsed.severity?.score}/10
          </span>
        </div>
        {parsed.steps?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">What to do</p>
            <ul className="space-y-1.5">
              {parsed.steps.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-teal-500 font-bold">{i + 1}.</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {parsed.tips?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Tips</p>
            <ul className="space-y-1 list-disc list-inside">
              {parsed.tips.map((t, i) => <li key={i} className="text-sm text-gray-600">{t}</li>)}
            </ul>
          </div>
        )}
        {parsed.seekDoctorIf?.length > 0 && (
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-xs font-medium text-red-500 mb-2">See a doctor if</p>
            <ul className="space-y-1 list-disc list-inside">
              {parsed.seekDoctorIf.map((s, i) => <li key={i} className="text-sm text-red-600">{s}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-gray-400 italic pt-2">{parsed.disclaimer}</p>
      </div>
    );
  }

  if (item.type === "medicine") {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">{parsed.category}</p>
          <p className="font-semibold text-gray-800">{parsed.medicineName}</p>
          <p className="text-sm text-gray-600 mt-1">{parsed.summary}</p>
        </div>
        {parsed.usedFor?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Used for</p>
            <ul className="space-y-1 list-disc list-inside">
              {parsed.usedFor.map((u, i) => <li key={i} className="text-sm text-gray-600">{u}</li>)}
            </ul>
          </div>
        )}
        {parsed.whenToTake && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">When to take</p>
            <p className="text-sm text-gray-600">{parsed.whenToTake}</p>
          </div>
        )}
        {parsed.whenNotToTake?.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs font-medium text-orange-600 mb-2">When NOT to take</p>
            <ul className="space-y-1 list-disc list-inside">
              {parsed.whenNotToTake.map((w, i) => <li key={i} className="text-sm text-orange-700">{w}</li>)}
            </ul>
          </div>
        )}
        {parsed.sideEffects?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {parsed.sideEffects.map((s, i) => (
              <span key={i} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 italic pt-2">{parsed.disclaimer}</p>
      </div>
    );
  }

  if (item.type === "labReport") {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">{parsed.reportType}</p>
          <p className="text-sm text-gray-600">{parsed.overallSummary}</p>
          <span className="inline-block mt-2 text-xs bg-violet-50 text-violet-600 px-3 py-1 rounded-full font-medium">
            {parsed.overallStatus}
          </span>
        </div>
        {parsed.parameters?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Values</p>
            {parsed.parameters.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5 text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="text-xs text-gray-500">{p.value} · {p.status}</span>
              </div>
            ))}
          </div>
        )}
        {parsed.recommendedActions?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Next steps</p>
            <ul className="space-y-1 list-disc list-inside">
              {parsed.recommendedActions.map((a, i) => <li key={i} className="text-sm text-gray-600">{a}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-gray-400 italic pt-2">{parsed.disclaimer}</p>
      </div>
    );
  }

  if (item.type === "recommendation") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-500">{parsed.wellnessScore}/100</p>
          <p className="text-sm text-gray-600 mt-1">{parsed.summary}</p>
        </div>
        {parsed.focusAreas?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Focus areas</p>
            <div className="space-y-2">
              {parsed.focusAreas.map((f, i) => (
                <div key={i} className="bg-amber-50 rounded-lg p-2.5">
                  <p className="text-sm font-medium text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {parsed.dailyHabits?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Daily habits</p>
            <ul className="space-y-1 list-disc list-inside">
              {parsed.dailyHabits.map((h, i) => <li key={i} className="text-sm text-gray-600">{h}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-gray-400 italic pt-2">{parsed.disclaimer}</p>
      </div>
    );
  }

  return null;
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const AiHistory = () => {
  const { getToken } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setError("Please sign in to view your AI history.");
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_BASE}/api/ai/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

   const [deletingId, setDeletingId] = useState(null);

const handleDelete = async (id, e) => {
  e.stopPropagation(); // taaki card ka click (modal open) trigger na ho
  if (!window.confirm("Kya aap sach mein yeh delete karna chahte hain?")) return;

  setDeletingId(id);
  try {
    const token = await getToken();
    if (!token) {
      alert("Please sign in to delete history item.");
      return;
    }
    await axios.delete(`${API_BASE}/api/ai/history/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHistory((prev) => prev.filter((item) => item._id !== id));
    if (selected?._id === id) setSelected(null); // agar modal open tha usi item ka, close kar do
  } catch (err) {
    alert(err?.response?.data?.message || "Delete failed. Please try again.");
  } finally {
    setDeletingId(null);
  }
};

  const filtered = filter === "all" ? history : history.filter((h) => h.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-slate-50 px-4 sm:px-6 py-10">
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-white mb-3 shadow-lg">
            <Clock size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Your AI History</h1>
          <p className="text-gray-400 mt-1 text-sm">All your past AI feature interactions in one place</p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <Loader2 className="animate-spin mb-3" size={32} />
            <p className="text-sm">Loading your history...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-gray-300">
            <Inbox size={48} className="mb-3" />
            <p className="text-sm">No history found in this category yet</p>
          </motion.div>
        )}

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const cfg = typeConfig[item.type] || typeConfig.assistant;
              const Icon = cfg.icon;
              const meta = getCardMeta(item);
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelected(item)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg p-4 flex items-center gap-4 cursor-pointer transition-all border border-transparent hover:border-gray-100"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${cfg.color} text-white shrink-0 shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</p>
                      {meta.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} font-medium`}>
                          {meta.badge}
                        </span>
                      )}
                      {meta.invalid && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 font-medium">Invalid</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{meta.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{meta.sub}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={(e) => handleDelete(item._id, e)}
    disabled={deletingId === item._id}
    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
    title="Delete"
  >
    {deletingId === item._id ? (
      <Loader2 size={14} className="animate-spin" />
    ) : (
      <Trash2 size={14} />
    )}
  </motion.button>
  <div className="flex items-center gap-1.5">
    {item.imageUrl && <ImageIcon size={14} className="text-gray-300" />}
  </div>
  <span className="text-[10px] text-gray-300 whitespace-nowrap">{formatDate(item.createdAt)}</span>
</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {(() => {
                    const cfg = typeConfig[selected.type] || typeConfig.assistant;
                    const Icon = cfg.icon;
                    return (
                      <>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${cfg.color} text-white`}>
                          <Icon size={16} />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{cfg.label}</span>
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-400">{formatDate(selected.createdAt)}</p>

                {selected.imageUrl && (
                  <img src={selected.imageUrl} alt="uploaded" className="rounded-xl w-full max-h-56 object-cover" />
                )}

                {selected.inputText && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    <span className="font-medium text-gray-500 text-xs block mb-1">Your input:</span>
                    {selected.inputText}
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                <DetailContent item={selected} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiHistory;