import express from "express";
import upload from "../middlewares/multer.js";
import {
  analyzeSymptoms, scanMedicine, analyzeLabReport,
  healthAssistant, getRecommendations, getMyAiHistory,
  deleteAiHistoryItem,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/symptom-analyzer", upload.single("image"), analyzeSymptoms);
aiRouter.post("/medicine-scanner", upload.single("image"), scanMedicine);
aiRouter.post("/lab-report", upload.single("image"), analyzeLabReport);
aiRouter.post("/assistant", healthAssistant);
aiRouter.post("/recommendations", getRecommendations);
aiRouter.get("/history", getMyAiHistory);
aiRouter.delete("/history/:id", deleteAiHistoryItem);

export default aiRouter;