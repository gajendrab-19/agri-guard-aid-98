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
    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      return { reply: "", error: "HF_API_KEY is not configured." };
    }

    const langName = langNames[data.lang as Lang];
    const system = `You are AgriGuard, a friendly expert assistant for farmers. You provide concise, practical advice on crops, soil, pests, irrigation, fertilizers, and weather. Always respond in ${langName} language. Keep answers under 150 words.`;

    // Build Zephyr chat prompt format
    let prompt = `<|system|>\n${system}</s>\n`;
    for (const m of data.history) {
      const role = m.role === "user" ? "user" : "assistant";
      prompt += `<|${role}|>\n${m.content}</s>\n`;
    }
    prompt += `<|user|>\n${data.message}</s>\n<|assistant|>\n`;

    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 350,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("HF error", res.status, txt);
        return { reply: "", error: `Hugging Face error (${res.status}). Please try again.` };
      }

      const json = await res.json();
      const text =
        Array.isArray(json) && json[0]?.generated_text
          ? String(json[0].generated_text).trim()
          : typeof json?.generated_text === "string"
            ? json.generated_text.trim()
            : "";

      if (!text) return { reply: "", error: "Empty response from model. Try again." };
      return { reply: text, error: null };
    } catch (e) {
      console.error("askExpert failed", e);
      return { reply: "", error: "Request failed. Please try again." };
    }
  });
