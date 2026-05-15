import { useEffect, useState } from "react";
import { useLang } from "@/lib/language-context";
import { Card } from "@/components/ui/card";
import { Newspaper, ArrowUpRight, Loader2, RefreshCw, Cpu, Landmark, Sprout, BarChart3, CloudSun, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchAgriNews, type NewsItem, type NewsCategory } from "@/lib/news.functions";

const CATEGORIES: { id: NewsCategory; label: string; icon: typeof Cpu }[] = [
  { id: "crops", label: "Crops", icon: Sprout },
  { id: "technology", label: "Technology", icon: Cpu },
  { id: "schemes", label: "Schemes", icon: Landmark },
  { id: "market", label: "Market & Rates", icon: BarChart3 },
  { id: "weather", label: "Weather", icon: CloudSun },
];

function NoImagePlaceholder({ category }: { category: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary text-primary/40">
      <ImageOff className="h-8 w-8" />
      <span className="mt-1 text-xs font-medium">{category}</span>
    </div>
  );
}

export function News() {
  const { t, lang } = useLang();
  const [active, setActive] = useState<NewsCategory>("crops");
  const [cache, setCache] = useState<Record<string, NewsItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"currents" | "fallback" | null>(null);

  const cacheKey = `${active}:${lang}`;
  const items = cache[cacheKey] ?? [];

  const load = async (force = false) => {
    if (!force && cache[cacheKey]?.length) return;
    setLoading(true);
    try {
      const res = await fetchAgriNews({ lang, category: active });
      setCache((c) => ({ ...c, [cacheKey]: res.items }));
      setSource(res.source);
    } catch {
      // keep stale cache
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lang]);

  return (
    <section id="news" className="bg-gradient-to-b from-secondary/30 to-background py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Newspaper className="h-3.5 w-3.5" /> Live Agri-News
          </div>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t.news.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.news.subtitle}</p>
        </div>

        <Tabs value={active} onValueChange={(v) => setActive(v as NewsCategory)}>
          <div className="mb-6 flex flex-col items-center gap-3">
            <TabsList className="flex h-auto flex-wrap justify-center gap-1 bg-secondary/60 p-1">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <TabsTrigger key={c.id} value={c.id} className="gap-1.5 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium sm:text-sm">{c.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <div className="flex items-center gap-3">
              <Button onClick={() => load(true)} disabled={loading} variant="outline" size="sm">
                {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
                Refresh
              </Button>
              {source && (
                <span className="text-xs text-muted-foreground">
                  Source: {source === "currents" ? "Currents API" : "AgriGuard curated"}
                </span>
              )}
            </div>
          </div>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-0">
              {loading && items.length === 0 ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No news available right now.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item, i) => (
                    <Card
                      key={`${cacheKey}-${i}`}
                      className="group flex flex-col overflow-hidden border-primary/10 p-0 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                              // Hide broken real images, show placeholder
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden");
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : null}
                        <div className={`h-full w-full ${item.image ? "hidden" : ""}`}>
                          <NoImagePlaceholder category={item.category} />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                            {item.category}
                          </span>
                          <span className="text-muted-foreground">{item.date}</span>
                        </div>
                        <h3 className="mt-3 line-clamp-3 text-base font-bold leading-snug">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                        )}
                        <a
                          href={item.url || "#"}
                          target={item.url ? "_blank" : undefined}
                          rel={item.url ? "noopener noreferrer" : undefined}
                          className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary hover:underline"
                        >
                          {t.news.readMore} <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
