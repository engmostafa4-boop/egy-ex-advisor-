import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGemini(prompt: string, context?: string) {
  try {
    const fullPrompt = context ? `Context:\n${context}\n\nUser Question:\n${prompt}` : prompt;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: {
        systemInstruction: "You are an expert AI financial advisor for the Egyptian Stock Exchange (EGX). Your name is 'EGX Smart Advisor'. You provide simple, clear, and educational stock analysis and market updates in Arabic. Since this is an educational tool, remind users that analyzing stocks involves risks. Do NOT give direct financial advice, just education and analysis based on fundamentals or market conditions. Only reply in Arabic.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "للأسف، حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.";
  }
}
