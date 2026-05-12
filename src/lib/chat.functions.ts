import { createServerFn } from "@tanstack/react-start";
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
  en: "I’m having trouble reaching the live AI service right now, but here is practical guidance: inspect the crop closely, check leaf color/spots, soil moisture, recent weather, and pest activity. Avoid overwatering, remove badly affected leaves, and use balanced fertilizer. If you describe the crop, symptoms, and your location, I can guide you step by step.",
  ta: "தற்போது நேரடி AI சேவையை அணுக முடியவில்லை, ஆனால் நடைமுறை ஆலோசனை: பயிரை நெருக்கமாகப் பாருங்கள், இலை நிறம்/புள்ளிகள், மண் ஈரப்பதம், சமீபத்திய வானிலை, பூச்சி தாக்கம் ஆகியவற்றைச் சரிபார்க்கவும். அதிக நீர்ப்பாசனத்தைத் தவிர்க்கவும், அதிகம் பாதிக்கப்பட்ட இலைகளை அகற்றவும், சமநிலை உரம் பயன்படுத்தவும்.",
  te: "ప్రస్తుతం లైవ్ AI సేవను చేరుకోవడంలో సమస్య ఉంది, కానీ ఉపయోగకరమైన సూచన: పంటను దగ్గరగా పరిశీలించండి, ఆకుల రంగు/మచ్చలు, నేల తేమ, ఇటీవలి వాతావరణం, పురుగుల ప్రభావం చూడండి. అధిక నీటిపారుదల నివారించండి, ఎక్కువగా ప్రభావితమైన ఆకులను తొలగించండి, సమతుల్య ఎరువు వాడండి.",
  kn: "ಈಗ ಲೈವ್ AI ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆ ಇದೆ, ಆದರೆ ಉಪಯುಕ್ತ ಸಲಹೆ: ಬೆಳೆವನ್ನು ಹತ್ತಿರದಿಂದ ಪರಿಶೀಲಿಸಿ, ಎಲೆ ಬಣ್ಣ/ಚುಕ್ಕೆಗಳು, ಮಣ್ಣಿನ ತೇವಾಂಶ, ಇತ್ತೀಚಿನ ಹವಾಮಾನ ಮತ್ತು ಕೀಟ ಚಟುವಟಿಕೆ ನೋಡಿ. ಅತಿಯಾಗಿ ನೀರು ಹಾಕಬೇಡಿ, ಹೆಚ್ಚು ಬಾಧಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಸಮತೋಲನ ಗೊಬ್ಬರ ಬಳಸಿ.",
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

export const askExpert = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { reply: "", error: "AI service is not configured." };
    }

    const langName = langNames[data.lang as Lang];
    const system = `You are AgriGuard, a friendly expert assistant for farmers. You provide concise, practical advice on crops, soil, pests, irrigation, fertilizers, and weather. Always respond in ${langName} language. Keep answers under 150 words and use markdown formatting where helpful.`;

    const messages = [
      { role: "system", content: system },
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.message },
    ];

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          return { reply: "", error: "Rate limit reached. Please wait a moment and try again." };
        }
        if (res.status === 402) {
          return { reply: "", error: "AI credits exhausted. Please add funds in Workspace Settings → Usage." };
        }
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { reply: buildFallbackReply(data.message, data.lang as Lang), error: null };
      }

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content?.trim() ?? "";

      if (!text) return { reply: "", error: "Empty response from model. Try again." };
      return { reply: text, error: null };
    } catch (e) {
      console.error("askExpert failed", e);
      return { reply: buildFallbackReply(data.message, data.lang as Lang), error: null };
    }
  });
