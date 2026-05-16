import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";

const CATEGORIES = ["technology", "schemes", "crops", "market", "weather"];
const categoryQuery: Record<string, { keywords: string; category?: string; label: string }> = {
  technology: { keywords: "agriculture technology OR agritech OR farm technology OR drone farming OR precision agriculture", category: "technology", label: "Technology" },
  schemes:    { keywords: "farmer scheme OR PM-KISAN OR agriculture subsidy OR government farm policy India", label: "Schemes" },
  crops:      { keywords: "crop yield OR rice wheat farming OR kharif rabi OR Indian farmers crop", label: "Crops" },
  market:     { keywords: "mandi prices OR crop prices India OR agriculture market OR vegetable prices", label: "Market & Rates" },
  weather:    { keywords: "monsoon India OR weather farmers OR rainfall agriculture", label: "Weather" },
};

function ssgNewsPlugin(env: Record<string, string>) {
  return {
    name: 'vite-plugin-ssg-news',
    async buildStart() {
      const outDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const outPath = path.resolve(outDir, 'static-news.json');
      const NEWS_API_KEY = env.VITE_NEWS_API_KEY;
      const cache: Record<string, any[]> = {};
      
      if (NEWS_API_KEY) {
        for (const cat of CATEGORIES) {
          const params = new URLSearchParams({
            keywords: categoryQuery[cat].keywords,
            language: "en",
            country: "IN",
            page_size: "8",
            apiKey: NEWS_API_KEY,
          });
          if (categoryQuery[cat].category) params.set("category", categoryQuery[cat].category!);
          try {
            const res = await fetch(`https://api.currentsapi.services/v1/search?${params.toString()}`);
            if (res.ok) {
              const json: any = await res.json();
              const news = Array.isArray(json?.news) ? json.news : [];
              cache[cat] = news.slice(0, 8).map((n: any) => ({
                title: String(n.title ?? "").trim(),
                category: categoryQuery[cat].label,
                date: n.published ? new Date(n.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US"),
                url: n.url,
                image: n.image && n.image !== "None" ? n.image : undefined,
                description: n.description,
              }));
            }
          } catch (e) {
            console.error(`Failed to fetch ${cat}:`, e);
          }
        }
      }
      fs.writeFileSync(outPath, JSON.stringify(cache, null, 2));
      console.log("SSG: Wrote static news to public/static-news.json");
    }
  }
}

function antigravityMockPlugin() {
  return {
    name: 'vite-plugin-antigravity-mock',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/antigravity/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', () => {
            let userMessage = "";
            try {
              const data = JSON.parse(body);
              userMessage = data.message || "";
            } catch {}
            
            const lower = userMessage.toLowerCase();
            let reply = "I am your Antigravity local farming assistant. I can help you with crop management, pest control, weather advisories, and fertilizers. What would you like to know?";

            if (lower.includes("rice") || lower.includes("paddy")) {
              reply = "🌾 **Rice/Paddy Cultivation**:\n- **Water Management**: Maintain proper water levels (about 2-5 cm) depending on the growth stage.\n- **Pests & Diseases**: Monitor for stem borer, brown planthopper, and leaf blast. Early detection is key.\n- **Fertilizer**: Apply nitrogen in 3 split doses to prevent excess vegetative growth and increase yield.";
            } else if (lower.includes("wheat")) {
              reply = "🌾 **Wheat Cultivation**:\n- **Soil**: Needs well-drained, fertile soil.\n- **Irrigation**: Crucial during the crown root initiation (20-25 days after sowing) and flowering stages.\n- **Diseases**: Watch out for yellow rust and loose smut. Use resistant varieties and appropriate fungicides if needed.";
            } else if (lower.includes("tomato")) {
              reply = "🍅 **Tomato Farming**:\n- **Care**: Use staking to support the plants and improve aeration. Avoid wetting leaves during watering to prevent fungal diseases.\n- **Diseases**: Check for leaf curl, early blight, and fruit borer.\n- **Nutrients**: Requires a balanced NPK ratio, with higher potassium during the fruiting stage.";
            } else if (lower.includes("cotton")) {
              reply = "🌱 **Cotton Cultivation**:\n- **Soil**: Deep, well-drained black clay soils are ideal.\n- **Pests**: Bollworms and aphids are common threats. Regular monitoring and integrated pest management (IPM) are highly recommended.";
            } else if (lower.includes("pest") || lower.includes("disease") || lower.includes("insect")) {
              reply = "🐛 **Pest & Disease Management**:\n- Always inspect your crops closely, checking under the leaves and near the roots.\n- Use Neem oil as a preventive organic spray.\n- Remove and destroy badly infected plants immediately to prevent spreading.\nIf you specify the crop and symptoms, I can give a more precise remedy.";
            } else if (lower.includes("fertilizer") || lower.includes("soil") || lower.includes("nutrient")) {
              reply = "🌱 **Soil & Fertilizers**:\n- Conduct a soil test every 2-3 years.\n- Organic compost or vermicompost significantly improves soil health and moisture retention.\n- Apply synthetic fertilizers (NPK) strictly based on the soil test recommendations to avoid soil degradation.";
            } else if (lower.includes("weather") || lower.includes("rain")) {
              reply = "🌦️ **Weather Advisory**:\n- Avoid spraying fertilizers or pesticides if rain is expected within the next 24 hours.\n- Ensure your fields have proper drainage systems to prevent waterlogging during heavy monsoons.";
            } else if (userMessage.length > 5) {
              reply = "I understand you are asking about: '" + userMessage + "'. As an AI, I suggest regularly monitoring your field for early signs of stress, ensuring adequate soil moisture without overwatering, and maintaining a balanced nutrient profile. Could you provide more specific details about the crop type or symptoms?";
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ reply }));
          });
          return;
        }

        if (req.url === '/api/antigravity/storage/upload' && req.method === 'POST') {
          // Consume the multipart stream to prevent ECONNRESET/Network errors
          req.on('data', () => {});
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            // Dummy profile picture for demonstration
            res.end(JSON.stringify({ url: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=256&q=80" }));
          });
          return;
        }

        next();
      });
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      TanStackRouterVite(),
      react(),
      tailwindcss(),
      tsconfigPaths(),
      ssgNewsPlugin(env),
      antigravityMockPlugin(),
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});
