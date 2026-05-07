import { useLang } from "@/lib/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { Sprout } from "lucide-react";

export function Navbar() {
  const { t } = useLang();
  const links = [
    { href: "#home", label: t.nav.home },
    { href: "#diagnose", label: t.nav.diagnose },
    { href: "#chat", label: t.nav.chat },
    { href: "#news", label: t.nav.news },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#home" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">{t.brand}</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
