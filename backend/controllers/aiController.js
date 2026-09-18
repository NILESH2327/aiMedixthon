import fs from "fs";
import { getAuth } from "@clerk/express";
import cloudinary from "../utils/cloudinary.js";
import AiAnalysis from "../models/AiAnalysis.js";
import { askGemini, askGeminiWithImage, cleanJsonString } from "../utils/gemini.js";

const getUserId = (req) => {
  if (typeof req.auth === "function") {
    try {
      const authObj = req.auth();
      if (authObj?.userId) return authObj.userId;
    } catch (e) {}
  }
  if (req.auth?.userId) return req.auth.userId;
  try {
    const serverAuth = getAuth(req);
    if (serverAuth?.userId) return serverAuth.userId;
  } catch (e) {}
  return null;
};

const processImage = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");
    const ext = filePath.split(".").pop().toLowerCase();
    const mimeMap = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };
    const mimeType = mimeMap[ext] || "image/jpeg";

    const cloudinaryRes = await cloudinary.uploader.upload(filePath, {
      folder: "medixthon/ai-uploads",
    });

    return { base64Data, mimeType, imageUrl: cloudinaryRes.secure_url };
  } finally {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }
  }
};

export const analyzeSymptoms = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const { symptoms } = req.body;

    const prompt = `You are a careful medical assistant AI analyzing symptoms.

${req.file ? "An image was uploaded. First check: does this image actually show a visible physical symptom (like a rash, wound, swelling, skin condition, eye redness, etc.) or is it unrelated content (a document, table, object, random photo, etc.)? If it is NOT a symptom-related image, set isValidInput to false with a polite invalidReason." : ""}

Based on the text symptoms: "${symptoms || "none provided"}" ${req.file ? "and the attached image" : ""}, respond ONLY with a valid JSON object, no markdown formatting, no extra text, in this exact structure:

{
  "isValidInput": true or false,
  "invalidReason": "string, only meaningful if isValidInput is false, explain politely why this isn't a valid symptom input",
  "condition": "short name of the most likely condition",
  "summary": "1-2 sentence plain language summary",
  "severity": { "level": "Mild" | "Moderate" | "Severe" | "Emergency", "score": number from 1 to 10 },
  "steps": ["3-5 short actionable steps the person can take right now"],
  "tips": ["2-4 short general wellness tips"],
  "seekDoctorIf": ["2-4 warning signs meaning they should see a doctor immediately"],
  "disclaimer": "short disclaimer that this is not a medical diagnosis"
}

If isValidInput is false, still fill other fields with empty arrays/strings since they won't be shown.`;

    let aiText, imageUrl;
    if (req.file) {
      const r = await processImage(req.file.path);
      aiText = await askGeminiWithImage(prompt, r.base64Data, r.mimeType, true);
      imageUrl = r.imageUrl;
    } else {
      if (!symptoms) return res.status(400).json({ success: false, message: "Symptoms required" });
      aiText = await askGemini(prompt, true);
    }

    aiText = cleanJsonString(aiText);

    const saved = await AiAnalysis.create({
      clerkUserId: userId,
      type: "symptom",
      inputText: symptoms,
      imageUrl,
      aiResponse: aiText,
    });
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("Error in analyzeSymptoms:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const scanMedicine = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

    const prompt = `You are a pharmacist assistant AI. Look at this image carefully.

First check: does this image clearly show a medicine (tablet strip, bottle, box, syrup, injection, or packaging with a visible medicine name)? If it's NOT a medicine (random object, food, document, person, etc.), set isValidInput to false with a polite invalidReason.

Respond ONLY with valid JSON, no markdown, no extra text, in this exact structure:

{
  "isValidInput": true or false,
  "invalidReason": "string, only if isValidInput is false",
  "medicineName": "identified name of medicine",
  "category": "e.g. Painkiller, Antibiotic, Antacid, etc.",
  "summary": "1-2 sentence plain language description of what it is",
  "usedFor": ["3-5 specific problems/conditions this medicine helps with"],
  "whenToTake": "clear guidance on when/how it's typically taken",
  "benefits": ["2-4 key benefits when used correctly"],
  "whenNotToTake": ["3-5 situations when this should NOT be taken"],
  "sideEffects": ["3-5 common side effects / nuksan if misused"],
  "disclaimer": "firm reminder that this is general knowledge only, not a prescription, and to consult a doctor or pharmacist"
}`;

    const r = await processImage(req.file.path);
    let aiText = await askGeminiWithImage(prompt, r.base64Data, r.mimeType, true);
    aiText = cleanJsonString(aiText);

    const saved = await AiAnalysis.create({
      clerkUserId: userId,
      type: "medicine",
      imageUrl: r.imageUrl,
      aiResponse: aiText,
    });
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("Error in scanMedicine:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const analyzeLabReport = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "Report image required" });

    const prompt = `You are a medical lab report explainer AI. Look at this image carefully.

First check: does this image clearly show a medical lab report, test result, or scan report (blood test, sugar test, MRI, X-ray report, urine test, lipid profile, CBC, thyroid test, or any similar medical document with readable values or findings)? If it's NOT a lab/medical report (random object, unrelated document, photo, etc.), set isValidInput to false with a polite invalidReason.

Respond ONLY with valid JSON, no markdown, no extra text, in this exact structure:

{
  "isValidInput": true or false,
  "invalidReason": "string, only if isValidInput is false",
  "reportType": "e.g. Blood Sugar Test, CBC, Lipid Profile, MRI Brain, X-Ray Chest, etc.",
  "overallSummary": "2-3 sentence plain language summary of the report in simple words a non-medical person can understand",
  "overallStatus": "Normal" | "Mild Concern" | "Needs Attention" | "Urgent",
  "parameters": [
    {
      "name": "parameter name e.g. Fasting Blood Sugar, Hemoglobin, Cholesterol, or finding for scans",
      "value": "the actual value/finding as read from the report, with unit if present",
      "normalRange": "typical normal range for reference, or 'N/A' for scans/findings without numeric ranges",
      "status": "Normal" | "Low" | "High" | "Attention",
      "explanation": "1 short plain-language sentence explaining what this means for the person"
    }
  ],
  "whatItMeans": ["2-4 bullet points explaining in very simple terms what these results could indicate about the person's health"],
  "recommendedActions": ["3-5 practical next steps, e.g. lifestyle changes, follow-up tests, when to see a doctor"],
  "urgentSigns": ["0-4 warning signs if any value is dangerously abnormal and needs immediate medical attention; empty array if nothing urgent"],
  "disclaimer": "firm reminder that this is general knowledge only, not a diagnosis, and a doctor must interpret the actual report and decide treatment"
}

Extract as many parameters as are clearly visible in the report. If it's a scan (MRI/X-ray) rather than numeric blood values, use the "parameters" array for key findings/observations instead, with "value" being the finding and "normalRange" as "N/A".`;

    const r = await processImage(req.file.path);
    let aiText = await askGeminiWithImage(prompt, r.base64Data, r.mimeType, true);
    aiText = cleanJsonString(aiText);

    const saved = await AiAnalysis.create({
      clerkUserId: userId,
      type: "labReport",
      imageUrl: r.imageUrl,
      aiResponse: aiText,
    });
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("Error in analyzeLabReport:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const healthAssistant = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message required" });

    const prompt = `You are a warm, friendly healthcare assistant chatbot named "MediBot". Answer this health-related question in a conversational, easy-to-understand way. Keep it concise (under 150 words unless needed). If it's a medical emergency query, clearly tell the user to seek immediate help. Never diagnose — suggest consulting a doctor for anything serious. User's question: ${message}`;

    const aiText = await askGemini(prompt);

    const saved = await AiAnalysis.create({
      clerkUserId: userId,
      type: "assistant",
      inputText: message,
      aiResponse: aiText,
    });
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("Error in healthAssistant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const { age, gender, healthGoals } = req.body;
    if (!age || !gender || !healthGoals) {
      return res.status(400).json({ success: false, message: "Age, gender and health goals are required" });
    }

    const prompt = `You are a personalized healthcare advisor AI. Based on this profile:
Age: ${age}
Gender: ${gender}
Health Goals: ${healthGoals}

Respond ONLY with valid JSON, no markdown, no extra text, in this exact structure:

{
  "wellnessScore": number from 1 to 100,
  "summary": "2-3 sentence encouraging, personalized overview",
  "focusAreas": [{ "title": "short focus area name", "tip": "1-2 sentence actionable tip" }],
  "dailyHabits": ["4-6 short daily habit suggestions"],
  "checkupSchedule": [{ "test": "name of test", "frequency": "how often" }],
  "disclaimer": "reminder these are general wellness suggestions, not medical advice"
}

Provide 3-4 focusAreas and 3-4 checkupSchedule items relevant to their age and gender.`;

    let aiText = await askGemini(prompt, true);
    aiText = cleanJsonString(aiText);

    const saved = await AiAnalysis.create({
      clerkUserId: userId,
      type: "recommendation",
      inputText: `${age}, ${gender}, ${healthGoals}`,
      aiResponse: aiText,
    });
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("Error in getRecommendations:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyAiHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const history = await AiAnalysis.find({ clerkUserId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error("Error in getMyAiHistory:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAiHistoryItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const { id } = req.params;

    const item = await AiAnalysis.findOne({ _id: id, clerkUserId: userId });
    if (!item) return res.status(404).json({ success: false, message: "History item not found" });

    await AiAnalysis.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Error in deleteAiHistoryItem:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};