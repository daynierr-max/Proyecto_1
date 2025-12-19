
import { GoogleGenAI, Type } from "@google/genai";
import { PriceData } from "../types";

export const getSmartInsight = async (currentPrice: PriceData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explícale a un usuario que no entiende de electricidad por qué el precio actual de ${currentPrice.price.toFixed(4)} €/kWh es ${currentPrice.level === 'low' ? 'barato' : currentPrice.level === 'high' ? 'muy caro' : 'razonable'}. 
      Usa un tono amable, de asistente de Apple. Máximo 15 palabras. No menciones "kWh".`,
      config: {
        temperature: 0.7,
      },
    });
    
    return response.text || "La energía está en un nivel estable ahora mismo.";
  } catch (error) {
    console.error("Gemini insight error:", error);
    return currentPrice.level === 'low' ? "Es el momento ideal para las tareas pesadas." : "Intenta posponer grandes consumos por ahora.";
  }
};
