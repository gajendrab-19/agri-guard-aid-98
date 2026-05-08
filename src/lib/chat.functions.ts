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
          model: "google/gemini-3-flash-preview",
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
        return { reply: "", error: `AI service error (${res.status}). Please try again.` };
      }

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content?.trim() ?? "";

      if (!text) return { reply: "", error: "Empty response from model. Try again." };
      return { reply: text, error: null };
    } catch (e) {
      console.error("askExpert failed", e);
      return { reply: "", error: "Request failed. Please try again." };
    }
  });
