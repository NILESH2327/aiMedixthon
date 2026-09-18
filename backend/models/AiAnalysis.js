import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true },
    type: {
      type: String,
      enum: ["symptom", "medicine", "labReport", "assistant", "recommendation"],
      required: true,
    },
    inputText: { type: String },
    imageUrl: { type: String },
    aiResponse: { type: String, required: true },
  },
  { timestamps: true }
);

const AiAnalysis = mongoose.models.AiAnalysis || mongoose.model("AiAnalysis", aiAnalysisSchema);

export default AiAnalysis;