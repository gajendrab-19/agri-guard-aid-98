import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { langNames, type Lang } from "./translations";

const inputSchema = z.object({
  lang: z.enum(["en", "ta", "te", "kn"]),
});

export type NewsItem = { title: string; category: string; date: string };

const fallbackNews: Record<Lang, NewsItem[]> = {
  en: [
    { title: "Farmers Advised to Monitor Leaf Spot After Recent Humid Weather", category: "Weather", date: "May 12, 2026" },
    { title: "Soil Testing Camps Expanded Across South Indian Districts", category: "Schemes", date: "May 11, 2026" },
    { title: "Drip Irrigation Demand Rises Before Peak Summer Irrigation Cycle", category: "Technology", date: "May 10, 2026" },
    { title: "Local Markets Report Strong Demand for Vegetables and Pulses", category: "Market", date: "May 9, 2026" },
  ],
  ta: [
    { title: "ஈரப்பதமான வானிலைக்குப் பிறகு இலைப் புள்ளி நோயை கண்காணிக்க விவசாயிகளுக்கு அறிவுரை", category: "வானிலை", date: "மே 12, 2026" },
    { title: "தென்னிந்திய மாவட்டங்களில் மண் பரிசோதனை முகாம்கள் விரிவாக்கம்", category: "திட்டங்கள்", date: "மே 11, 2026" },
    { title: "கோடை நீர்ப்பாசன காலத்திற்கு முன் சொட்டுநீர் பாசன தேவை அதிகரிப்பு", category: "தொழில்நுட்பம்", date: "மே 10, 2026" },
    { title: "காய்கறி மற்றும் பருப்பு வகைகளுக்கு உள்ளூர் சந்தைகளில் வலுவான தேவை", category: "சந்தை", date: "மே 9, 2026" },
  ],
  te: [
    { title: "ఇటీవలి తేమ వాతావరణం తర్వాత ఆకుమచ్చలను గమనించాలంటూ రైతులకు సూచన", category: "వాతావరణం", date: "మే 12, 2026" },
    { title: "దక్షిణ భారత జిల్లాల్లో మట్టి పరీక్ష శిబిరాల విస్తరణ", category: "పథకాలు", date: "మే 11, 2026" },
    { title: "వేసవి నీటిపారుదల కాలానికి ముందు డ్రిప్ ఇరిగేషన్ డిమాండ్ పెరుగుతోంది", category: "సాంకేతికత", date: "మే 10, 2026" },
    { title: "కూరగాయలు మరియు పప్పులకు స్థానిక మార్కెట్లలో బలమైన డిమాండ్", category: "మార్కెట్", date: "మే 9, 2026" },
  ],
  kn: [
    { title: "ಇತ್ತೀಚಿನ ತೇವ ಹವಾಮಾನದ ನಂತರ ಎಲೆ ಚುಕ್ಕೆಗಳನ್ನು ಗಮನಿಸಲು ರೈತರಿಗೆ ಸಲಹೆ", category: "ಹವಾಮಾನ", date: "ಮೇ 12, 2026" },
    { title: "ದಕ್ಷಿಣ ಭಾರತೀಯ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಮಣ್ಣು ಪರೀಕ್ಷಾ ಶಿಬಿರಗಳ ವಿಸ್ತರಣೆ", category: "ಯೋಜನೆಗಳು", date: "ಮೇ 11, 2026" },
    { title: "ಬೇಸಿಗೆ ನೀರಾವರಿ ಅವಧಿಗೆ ಮೊದಲು ಡ್ರಿಪ್ ನೀರಾವರಿ ಬೇಡಿಕೆ ಏರಿಕೆ", category: "ತಂತ್ರಜ್ಞಾನ", date: "ಮೇ 10, 2026" },
    { title: "ತರಕಾರಿ ಮತ್ತು ಕಾಳುಗಳಿಗೆ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಬಲವಾದ ಬೇಡಿಕೆ", category: "ಮಾರುಕಟ್ಟೆ", date: "ಮೇ 9, 2026" },
  ],
};

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
        console.error("AI gateway error", res.status, await res.text());
        return { items: fallbackNews[data.lang as Lang], error: null };
      }

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content?.trim() ?? "";
      const parsed = JSON.parse(text);
      const items: NewsItem[] = Array.isArray(parsed?.items) ? parsed.items.slice(0, 4) : [];
      if (items.length === 0) return { items: [], error: "No news returned." };
      return { items, error: null };
    } catch (e) {
      console.error("fetchAgriNews failed", e);
      return { items: fallbackNews[data.lang as Lang], error: null };
    }
  });
