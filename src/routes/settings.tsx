import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { languages, type Lang } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, LogOut, Palette, User } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang } = useLang();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Customize your AgriGuard experience</p>

        {/* Language */}
        <Card className="mt-8 border-primary/10 p-6 shadow-[var(--shadow-card)]">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Globe className="h-5 w-5 text-primary" /> Language
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose your preferred language for the interface</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as Lang)}
                className={`rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                  lang === l.code
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-secondary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Appearance */}
        <Card className="mt-6 border-primary/10 p-6 shadow-[var(--shadow-card)]">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Palette className="h-5 w-5 text-primary" /> Appearance
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Theme customization coming soon. Currently using the Nature Green theme.
          </p>
          <div className="mt-4 flex gap-3">
            <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
              <div className="h-4 w-4 rounded-full bg-primary" />
              Nature Green
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-border px-4 py-3 text-sm font-medium text-muted-foreground opacity-50">
              <div className="h-4 w-4 rounded-full bg-gray-800" />
              Dark Mode (soon)
            </div>
          </div>
        </Card>

        {/* Account */}
        <Card className="mt-6 border-primary/10 p-6 shadow-[var(--shadow-card)]">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <User className="h-5 w-5 text-primary" /> Account
          </h3>
          {user ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{user.email}</span>
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/profile">View Profile</Link>
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Sign in to sync your preferences.</p>
              <Button asChild className="mt-3 rounded-full">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
