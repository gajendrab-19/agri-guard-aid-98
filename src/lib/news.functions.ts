import { z } from "zod";
import type { Lang } from "./translations";

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

export const fallbackNews: Record<NewsCategory, NewsItem[]> = {
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

const categoryQuery: Record<NewsCategory, { keywords: string; category?: string; label: string }> = {
  technology: { keywords: "agriculture technology OR agritech OR farm technology OR drone farming OR precision agriculture", category: "technology", label: "Technology" },
  schemes:    { keywords: "farmer scheme OR PM-KISAN OR agriculture subsidy OR government farm policy India", label: "Schemes" },
  crops:      { keywords: "crop yield OR rice wheat farming OR kharif rabi OR Indian farmers crop", label: "Crops" },
  market:     { keywords: "mandi prices OR crop prices India OR agriculture market OR vegetable prices", label: "Market & Rates" },
  weather:    { keywords: "monsoon India OR weather farmers OR rainfall agriculture", label: "Weather" },
};

function fmtDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export async function fetchLiveNews(cat: NewsCategory): Promise<{ items: NewsItem[]; source: "currents" | "fallback" }> {
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  if (NEWS_API_KEY) {
    try {
      const params = new URLSearchParams({
        keywords: categoryQuery[cat].keywords,
        language: "en",
        country: "IN",
        page_size: "8",
        apiKey: NEWS_API_KEY,
      });
      if (categoryQuery[cat].category) params.set("category", categoryQuery[cat].category!);

      const res = await fetch(`https://api.currentsapi.services/v1/search?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: any = await res.json();
        const news = Array.isArray(json?.news) ? json.news : [];
        const items: NewsItem[] = news
          .slice(0, 8)
          .map((n: any) => {
            const title = String(n.title ?? "").trim();
            const url = n.url && /^https?:\/\//i.test(n.url) ? n.url : `https://news.google.com/search?q=${encodeURIComponent(title)}`;
            return {
              title,
              category: categoryQuery[cat].label,
              date: fmtDate(n.published),
              url,
              image: n.image && n.image !== "None" ? n.image : undefined,
              description: n.description,
            };
          })
          .filter((n: NewsItem) => n.title.length > 0);

        if (items.length > 0) {
          return { items, source: "currents" };
        }
      }
    } catch (e) {
      console.error("Currents fetch failed", e);
    }
  }

  const items = fallbackNews[cat].map((n) => ({
    ...n,
    url: n.url ?? `https://news.google.com/search?q=${encodeURIComponent(n.title)}`,
  }));
  return { items, source: "fallback" };
}

