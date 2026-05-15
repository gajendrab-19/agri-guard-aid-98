import { useLang } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-farm.jpg";
import { Leaf, ArrowRight, Shield, Zap } from "lucide-react";

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

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
        <div className="animate-float absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-float-delayed absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
        <div className="max-w-2xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
            <Leaf className="h-3.5 w-3.5" /> {t.hero.tag}
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-foreground via-primary to-primary-glow bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.02]">
              <a href="#diagnose">
                {t.hero.cta} <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full transition-transform hover:scale-[1.02]">
              <a href="#chat">{t.hero.cta2}</a>
            </Button>
          </div>

          {/* Feature badges */}
          <div className="mt-10 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-medium">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="font-medium">4 Languages</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
