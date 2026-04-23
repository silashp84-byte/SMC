import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeMarketStructure(asset: string, signals: any[]) {
  const prompt = `
    Analise professional de mercado Forex para o par ${asset}.
    Sinais detectados nos últimos 15 minutos:
    ${JSON.stringify(signals.slice(-5))}

    Com base nesses sinais de Smart Money Concepts (BOS, CHOCH, Liquidez), forneça:
    1. Sentimento atual (Bullish/Bearish).
    2. Alvo de preço provável.
    3. Breve justificativa técnica.
    
    Responda em Português de forma concisa e profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Erro ao processar análise de IA.";
  }
}
