import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GeminiInsight {
  description: string;
  usageContext: string;
  priceTrend: "UP" | "DOWN" | "STABLE";
  trendReason: string;
  demandLevel: "HIGH" | "MEDIUM" | "LOW";
  isEmergency: boolean;
}

export const getMedicineInsights = async (
  medicineName: string,
  location: string,
  currentStock: number,
  batchExpiry: string
): Promise<GeminiInsight> => {
  // Validate API key
  if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
    console.error("❌ Gemini API Key is missing or invalid!");
    console.log("Please set VITE_GEMINI_API_KEY in your .env file");
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  console.log("🔍 Generating insights for:", { medicineName, location, currentStock, batchExpiry });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a specialized healthcare assistant for a pharmacy dashboard.
      Your task is to provide strictly factual, medical, and market insights for a specific medicine based on the user's location.
      
      Input Data:
      - Medicine: "${medicineName}"
      - User Location: "${location}"
      - Current Stock: ${currentStock} units
      - Nearest Expiry: ${batchExpiry}

      Contextual Awareness:
      - Consider the provided location ("${location}") and any typically known or currently active health events, seasons, or disease outbreaks associated with it (e.g., Dengue in tropical areas during monsoon, Flu in cold climates, etc.).
      - If the location typically has high demand for this medicine currently (based on general medical knowledge of the region and season), reflect that.

      Task:
      1. Provide a brief professional medical description of the medicine.
      2. Explain its primary usage context (what conditions it treats).
      3. Predict a Dynamic Price Trend (UP, DOWN, STABLE) and Demand Level (HIGH, MEDIUM, LOW).
         - Logic: If there is a known seasonal outbreak in "${location}" relevant to this drug, OR if stock is low (<50) and demand is typically high, Trend should be UP and Demand HIGH.
         - If the drug is rarely used or no outbreaks are relevant, Trend is STABLE/DOWN.
      4. Formatting: Return ONLY valid JSON.

      JSON Schema:
      {
        "description": "string",
        "usageContext": "string",
        "priceTrend": "UP" | "DOWN" | "STABLE",
        "trendReason": "string (explain why based on location/season/stock)",
        "demandLevel": "HIGH" | "MEDIUM" | "LOW",
        "isEmergency": boolean (true if relevant to a critical outbreak)
      }

      Constraints:
      - Do NOT hallucinate fake news, but use general knowledge about the region's climate/disease profile.
      - Strictly healthcare/pharmaceutical content.
      - If the location is generic or unknown, assume standard global demand.
    `;

    console.log("📤 Sending request to Gemini API...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("📥 Received response from Gemini:", text.substring(0, 200) + "...");

    // Clean up potential markdown code blocks
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(jsonString) as GeminiInsight;
    console.log("✅ Successfully parsed Gemini response:", parsed);

    return parsed;

  } catch (error) {
    console.error("❌ Gemini API Error:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return safe default if API fails
    return {
      description: "Unable to fetch medicine details at this time. Please check your internet connection and API key.",
      usageContext: "N/A",
      priceTrend: "STABLE",
      trendReason: "API Error: " + (error instanceof Error ? error.message : "Unknown error"),
      demandLevel: "MEDIUM",
      isEmergency: false
    };
  }
};
