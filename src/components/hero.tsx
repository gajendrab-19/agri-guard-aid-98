import { useLang } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-farm.jpg";
import { Leaf, ArrowRight } from "lucide-react";

export function Hero() {
  const { t } = useLang();
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Farmland"
          width={1536}
          height={1024}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Leaf className="h-3.5 w-3.5" /> {t.hero.tag}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full shadow-[var(--shadow-soft)]">
              <a href="#diagnose">
                {t.hero.cta} <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="#chat">{t.hero.cta2}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
