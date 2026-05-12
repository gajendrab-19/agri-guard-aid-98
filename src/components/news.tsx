import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/lib/language-context";
import { Card } from "@/components/ui/card";
import { Newspaper, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAgriNews, type NewsItem } from "@/lib/news.functions";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import news4 from "@/assets/news-4.jpg";

const images = [news1, news2, news3, news4];

export function News() {
  const { t, lang } = useLang();
  const fetchNews = useServerFn(fetchAgriNews);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNews({ data: { lang } });
      if (res.error) setError(res.error);
      setItems(res.items.length ? res.items : (t.news.items as NewsItem[]));
    } catch {
      setError("Failed to load news.");
      setItems(t.news.items as NewsItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <section id="news" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Newspaper className="h-3.5 w-3.5" /> Updates
          </div>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t.news.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.news.subtitle}</p>
          <div className="mt-4 flex items-center justify-center">
            <Button onClick={load} disabled={loading} variant="outline" size="sm">
              {loading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <Card
                key={i}
                className="group overflow-hidden border-primary/10 p-0 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={images[i % images.length]}
                    alt={item.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                      {item.category}
                    </span>
                    <span className="text-muted-foreground">{item.date}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-3 text-base font-bold leading-snug">
                    {item.title}
                  </h3>
                  <a
                    href="#"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {t.news.readMore} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
