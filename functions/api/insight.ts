import { type Env, generateContent, json, readJson, textOf } from "../../server/gemini";

const LEVEL_TEXT: Record<string, string> = { low: "barato", medium: "razonable", high: "muy caro" };

// POST /api/insight  { price, level }  →  { text }
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const body = await readJson(request);
  const { price, level } = body ?? {};
  if (typeof price !== "number" || !isFinite(price) || price < 0 || price > 10 || typeof level !== "string" || !Object.hasOwn(LEVEL_TEXT, level)) {
    return json({ error: "Parámetros no válidos" }, 400);
  }

  try {
    const response = await generateContent(env, "gemini-3-flash-preview", {
      contents: [{
        parts: [{
          text: `Explícale a un usuario que no entiende de electricidad por qué el precio actual de ${price.toFixed(4)} €/kWh es ${LEVEL_TEXT[level]}.
      Usa un tono amable, de asistente de Apple. Máximo 15 palabras. No menciones "kWh".`,
        }],
      }],
      generationConfig: { temperature: 0.7 },
    });
    return json({ text: textOf(response) });
  } catch (error) {
    console.error("insight:", error);
    return json({ error: "Servicio no disponible" }, 502);
  }
}
