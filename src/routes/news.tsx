import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { News } from "@/components/news";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/news")({
  component: NewsPage,
});

function NewsPage() {
  useEffect(() => {
    document.title = "AgriGuard — Latest Agricultural News";
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
        <News />
      </div>
    </LanguageProvider>
  );
}
