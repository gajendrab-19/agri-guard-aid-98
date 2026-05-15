import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { DiseaseIdentifier } from "@/components/disease-identifier";
import { FloatingChatBot } from "@/components/floating-chatbot";
import { News } from "@/components/news";
import { useLang } from "@/lib/language-context";
import { Sprout, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
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

function NewsPreview() {
  const { t } = useLang();
  return (
    <div>
      <News />
      <div className="flex justify-center pb-10">
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link to="/news">
            View All News <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <DiseaseIdentifier />
        <NewsPreview />
      </main>
      <FloatingChatBot />
      <Footer />
    </div>
  );
}
