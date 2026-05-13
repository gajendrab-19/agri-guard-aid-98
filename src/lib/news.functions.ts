import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { langNames, type Lang } from "./translations";

export type NewsCategory = "technology" | "schemes" | "crops" | "market" | "weather";

const inputSchema = z.object({
  lang: z.enum(["en", "ta", "te", "kn"]),
  category: z.enum(["technology", "schemes", "crops", "market", "weather"]).default("crops"),
});

export type NewsItem = {
  title: string;
  category: string;
  date: string;
  url?: string;
  image?: string;
  description?: string;
};

// Map our app categories -> Currents API params
const categoryQuery: Record<NewsCategory, { keywords: string; category?: string; label: string }> = {
  technology: { keywords: "agriculture technology OR agritech OR farm technology OR drone farming OR precision agriculture", category: "technology", label: "Technology" },
  schemes:    { keywords: "farmer scheme OR PM-KISAN OR agriculture subsidy OR government farm policy India", label: "Schemes" },
  crops:      { keywords: "crop yield OR rice wheat farming OR kharif rabi OR Indian farmers crop", label: "Crops" },
  market:     { keywords: "mandi prices OR crop prices India OR agriculture market OR vegetable prices", label: "Market & Rates" },
  weather:    { keywords: "monsoon India OR weather farmers OR rainfall agriculture", label: "Weather" },
};

const langCodeMap: Record<Lang, string> = { en: "en", ta: "en", te: "en", kn: "en" }; // Currents free tier mostly english; AI translates fallback

const fallbackNews: Record<NewsCategory, NewsItem[]> = {
  technology: [
    { title: "Drone Spraying Adoption Rises Across South Indian Farms", category: "Technology", date: "May 12, 2026" },
    { title: "AI-Powered Soil Sensors Now Affordable for Smallholders", category: "Technology", date: "May 11, 2026" },
    { title: "New IoT Irrigation Controllers Cut Water Use by 35%", category: "Technology", date: "May 10, 2026" },
    { title: "Satellite Crop Monitoring Pilot Expands to Telangana", category: "Technology", date: "May 9, 2026" },
  ],
  schemes: [
    { title: "PM-KISAN 17th Instalment Disbursement Begins This Week", category: "Schemes", date: "May 12, 2026" },
    { title: "State Subsidy on Drip Irrigation Increased to 75%", category: "Schemes", date: "May 11, 2026" },
    { title: "New Crop Insurance Window Opens for Kharif Season", category: "Schemes", date: "May 10, 2026" },
    { title: "Soil Health Card Camps Scheduled in 200 Villages", category: "Schemes", date: "May 9, 2026" },
  ],
  crops: [
    { title: "Record Rice Harvest Expected in Tamil Nadu This Season", category: "Crops", date: "May 12, 2026" },
    { title: "Advisory: Watch for Leaf Blight After Recent Humid Weather", category: "Crops", date: "May 11, 2026" },
    { title: "Cotton Sowing Picks Up Pace in Andhra Pradesh", category: "Crops", date: "May 10, 2026" },
    { title: "Pulses Production Forecast Revised Upward for 2026", category: "Crops", date: "May 9, 2026" },
  ],
  market: [
    { title: "Tomato Prices Surge as Demand Outpaces Supply", category: "Market", date: "May 12, 2026" },
    { title: "Onion Mandi Rates Stabilise After Two-Week Volatility", category: "Market", date: "May 11, 2026" },
    { title: "Wheat MSP Procurement Crosses 80% of Target", category: "Market", date: "May 10, 2026" },
    { title: "Pulses Export Demand Strengthens Local Prices", category: "Market", date: "May 9, 2026" },
  ],
  weather: [
    { title: "Southwest Monsoon Forecast: Above Normal Rainfall Expected", category: "Weather", date: "May 12, 2026" },
    { title: "Heatwave Advisory Issued for Interior Karnataka", category: "Weather", date: "May 11, 2026" },
    { title: "IMD Issues Heavy Rainfall Alert for Coastal Tamil Nadu", category: "Weather", date: "May 10, 2026" },
    { title: "Pre-Monsoon Showers Boost Sowing Across Telangana", category: "Weather", date: "May 9, 2026" },
  ],
};

function fmtDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

async function translateItems(items: NewsItem[], targetLang: Lang): Promise<NewsItem[]> {
  if (targetLang === "en") return items;
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) return items;
  const langName = langNames[targetLang];
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `Translate ONLY the "title" and "category" fields of each JSON item to ${langName}. Keep "date" and other fields unchanged. Return JSON of shape {"items":[...]}.` },
          { role: "user", content: JSON.stringify({ items }) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return items;
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(text);
    const out: NewsItem[] = Array.isArray(parsed?.items) ? parsed.items : items;
    return out.map((it, i) => ({ ...items[i], ...it }));
  } catch {
    return items;
  }
}

export const fetchAgriNews = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ items: NewsItem[]; error: string | null; source: "currents" | "fallback" }> => {
    const cat = data.category as NewsCategory;
    const lang = data.lang as Lang;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    if (NEWS_API_KEY) {
      try {
        const params = new URLSearchParams({
          keywords: categoryQuery[cat].keywords,
          language: langCodeMap[lang],
          country: "IN",
          page_size: "8",
          apiKey: NEWS_API_KEY,
        });
        if (categoryQuery[cat].category) params.set("category", categoryQuery[cat].category!);

        const res = await fetch(`https://api.currentsapi.services/v1/latest-news?${params.toString()}`);
        if (res.ok) {
          const json: any = await res.json();
          const news = Array.isArray(json?.news) ? json.news : [];
          let items: NewsItem[] = news.slice(0, 8).map((n: any) => ({
            title: String(n.title ?? "").trim(),
            category: categoryQuery[cat].label,
            date: fmtDate(n.published),
            url: n.url,
            image: n.image && n.image !== "None" ? n.image : undefined,
            description: n.description,
          })).filter((n: NewsItem) => n.title.length > 0);

          if (items.length > 0) {
            items = await translateItems(items.slice(0, 8), lang);
            return { items, error: null, source: "currents" };
          }
        } else {
          console.error("Currents API error", res.status, await res.text());
        }
      } catch (e) {
        console.error("Currents fetch failed", e);
      }
    }

    // Fallback
    const items = await translateItems(fallbackNews[cat], lang);
    return { items, error: null, source: "fallback" };
  });
