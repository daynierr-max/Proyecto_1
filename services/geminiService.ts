
import { PriceData } from "../types";

// La llamada a Gemini se hace en el servidor (functions/api/insight.ts):
// la clave de API nunca llega al navegador.
export const getSmartInsight = async (currentPrice: PriceData) => {
  try {
    const res = await fetch("/api/insight", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ price: currentPrice.price, level: currentPrice.level }),
    });
    if (!res.ok) throw new Error(`/api/insight respondió ${res.status}`);
    const response = await res.json();

    return response.text || "La energía está en un nivel estable ahora mismo.";
  } catch (error) {
    console.error("Gemini insight error:", error);
    return currentPrice.level === 'low' ? "Es el momento ideal para las tareas pesadas." : "Intenta posponer grandes consumos por ahora.";
  }
};
