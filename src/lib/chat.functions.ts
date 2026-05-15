import { z } from "zod";
import { langNames, type Lang } from "./translations";

const inputSchema = z.object({
  message: z.string().min(1).max(2000),
  lang: z.enum(["en", "ta", "te", "kn"]),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional()
    .default([]),
});

const fallbackAdvice: Record<Lang, string> = {
  en: "I'm having trouble reaching the live AI service right now, but here is practical guidance: inspect the crop closely, check leaf color/spots, soil moisture, recent weather, and pest activity. Avoid overwatering, remove badly affected leaves, and use balanced fertilizer. If you describe the crop, symptoms, and your location, I can guide you step by step.",
  ta: "தற்போது நேரடி AI சேவையை அணுக முடியவில்லை, ஆனால் நடைமுறை ஆலோசனை: பயிரை நெருக்கமாகப் பாருங்கள், இலை நிறம்/புள்ளிகள், மண் ஈரப்பதம், சமீபத்திய வானிலை, பூச்சி தாக்கம் ஆகியவற்றைச் சரிபார்க்கவும்.",
  te: "ప్రస్తుతం లైవ్ AI సేవను చేరుకోవడంలో సమస్య ఉంది, కానీ ఉపయోగకరమైన సూచన: పంటను దగ్గరగా పరిశీలించండి, ఆకుల రంగు/మచ్చలు, నేల తేమ, ఇటీవలి వాతావరణం చూడండి.",
  kn: "ಈಗ ಲೈವ್ AI ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆ ಇದೆ, ಆದರೆ ಉಪಯುಕ್ತ ಸಲಹೆ: ಬೆಳೆವನ್ನು ಹತ್ತಿರದಿಂದ ಪರಿಶೀಲಿಸಿ, ಎಲೆ ಬಣ್ಣ/ಚುಕ್ಕೆಗಳು, ಮಣ್ಣಿನ ತೇವಾಂಶ ನೋಡಿ.",
};

function buildFallbackReply(message: string, lang: Lang) {
  const lower = message.toLowerCase();
  const cropHint = lower.includes("wheat")
    ? "\n\nWheat tip: keep the field well drained, watch for rust/yellowing, and apply nitrogen in split doses."
    : lower.includes("rice") || lower.includes("paddy")
      ? "\n\nRice tip: maintain proper water level, monitor blast/brown spot, and avoid excess nitrogen."
      : lower.includes("tomato")
        ? "\n\nTomato tip: check for leaf curl, early blight, and fruit borer; use staking and avoid wetting leaves."
        : "";

  return `${fallbackAdvice[lang]}${lang === "en" ? cropHint : ""}`;
}

type ChatInput = z.infer<typeof inputSchema>;

/**
 * Calls the Gemini REST API directly from the client.
 * API key is read from VITE_GEMINI_API_KEY.
 */
export async function askExpert(input: ChatInput): Promise<{ reply: string; error: string | null }> {
  const data = inputSchema.parse(input);
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return { reply: buildFallbackReply(data.message, data.lang as Lang), error: "AI service is not configured. Add VITE_GEMINI_API_KEY to your .env file." };
  }

  const langName = langNames[data.lang as Lang];
  const systemInstruction = `You are AgriGuard, a friendly expert assistant for farmers. You provide concise, practical advice on crops, soil, pests, irrigation, fertilizers, and weather. Always respond in ${langName} language. Keep answers under 150 words and use markdown formatting where helpful.`;

  // Build Gemini-format contents from chat history
  const contents = [
    ...data.history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: data.message }] },
  ];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
        }),
      },
    );

    if (!res.ok) {
      if (res.status === 429) {
        return { reply: "", error: "Rate limit reached. Please wait a moment and try again." };
      }
      const txt = await res.text();
      console.error("Gemini API error", res.status, txt);
      return { reply: buildFallbackReply(data.message, data.lang as Lang), error: null };
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!text) return { reply: "", error: "Empty response from model. Try again." };
    return { reply: text, error: null };
  } catch (e) {
    console.error("askExpert failed", e);
    return { reply: buildFallbackReply(data.message, data.lang as Lang), error: null };
  }
}
