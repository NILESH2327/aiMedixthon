import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const cleanJsonString = (text) => {
  if (!text) return "";
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
};

export const askGemini = async (prompt, jsonMode = false) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    ...(jsonMode && { generationConfig: { responseMimeType: "application/json" } }),
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return jsonMode ? cleanJsonString(text) : text;
};

export const askGeminiWithImage = async (prompt, base64Data, mimeType, jsonMode = false) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    ...(jsonMode && { generationConfig: { responseMimeType: "application/json" } }),
  });
  const imagePart = { inlineData: { data: base64Data, mimeType } };
  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  return jsonMode ? cleanJsonString(text) : text;
};
