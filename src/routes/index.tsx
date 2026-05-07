import { createFileRoute } from "@tanstack/react-router";
import { LanguageProvider } from "@/lib/language-context";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { DiseaseIdentifier } from "@/components/disease-identifier";
import { ChatBot } from "@/components/chatbot";
import { News } from "@/components/news";
import { useLang } from "@/lib/language-context";
import { Sprout } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AgriGuard — AI-Powered Plant Disease Detection & Farming Assistant" },
      {
        name: "description",
        content:
          "Identify plant diseases instantly with AI, chat with a multilingual farming expert, and read the latest agri-news. Available in English, Tamil, Telugu, and Kannada.",
      },
    ],
  }),
});

function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t bg-card py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold">{t.brand}</span>
        </div>
        <p className="text-sm text-muted-foreground">{t.footer}</p>
        <p className="text-xs text-muted-foreground">© 2026 {t.brand}</p>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <DiseaseIdentifier />
          <ChatBot />
          <News />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
