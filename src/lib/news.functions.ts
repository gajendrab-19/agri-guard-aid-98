import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { langNames, type Lang } from "./translations";

const inputSchema = z.object({
  lang: z.enum(["en", "ta", "te", "kn"]),
});

export type NewsItem = { title: string; category: string; date: string };

export const fetchAgriNews = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ items: NewsItem[]; error: string | null }> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { items: [], error: "AI service is not configured." };
    }

    const langName = langNames[data.lang as Lang];
    const today = new Date().toISOString().split("T")[0];

    const system = `You are an Indian agriculture news editor. Generate 4 realistic, recent-sounding agricultural news headlines for South Indian farmers (Tamil Nadu, Karnataka, Andhra Pradesh, Telangana). Cover diverse categories like Crops, Policy, Technology, Market, Weather, or Schemes. Today's date is ${today}. Respond in ${langName} language. Return ONLY valid JSON of shape: {"items":[{"title":"...","category":"...","date":"Month D, YYYY"}]}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: "Generate 4 fresh agricultural news headlines now." },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { items: [], error: "Rate limit. Try again soon." };
        if (res.status === 402) return { items: [], error: "AI credits exhausted." };
        return { items: [], error: `AI service error (${res.status}).` };
      }

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content?.trim() ?? "";
      const parsed = JSON.parse(text);
      const items: NewsItem[] = Array.isArray(parsed?.items) ? parsed.items.slice(0, 4) : [];
      if (items.length === 0) return { items: [], error: "No news returned." };
      return { items, error: null };
    } catch (e) {
      console.error("fetchAgriNews failed", e);
      return { items: [], error: "Failed to load news." };
    }
  });
