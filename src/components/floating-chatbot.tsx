import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bot, User, MessageCircle, X, Minimize2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function FloatingChatBot() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    setMessages([]);
  }, [lang]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      // Native Antigravity chatbot implementation
      const res = await fetch("/api/antigravity/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-8), lang }),
      });
      if (!res.ok) throw new Error("Antigravity orchestrator unreachable");
      const data = await res.json();
      setMessages([...newMsgs, { role: "assistant", content: data.reply }]);
      if (!open) setUnread(true);
    } catch (err: any) {
      setMessages([...newMsgs, { role: "assistant", content: `⚠️ ${err.message || "Network error. Please try again."}` }]);
    } finally {
      setLoading(false);
    }
  }

  const displayMessages: Msg[] =
    messages.length === 0 ? [{ role: "assistant", content: t.chat.welcome }] : messages;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen((o) => !o); setUnread(false); }}
        aria-label={open ? "Close chat" : "Open chat"}
        className={`fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-105 hover:bg-primary/90 md:bottom-6 md:right-6 ${open ? "rotate-90" : ""}`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread && (
          <span className="absolute right-1 top-1 h-3 w-3 animate-pulse rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-3 z-50 flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 md:right-6"
          role="dialog"
          aria-label="AgriGuard AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b bg-gradient-to-r from-primary to-primary-glow p-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                <Bot className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{t.chat.title}</p>
                <p className="text-[10px] opacity-90">Powered by Gemini · Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/20"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/40 p-3">
            {displayMessages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-primary"
                  }`}
                >
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <div className="[&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold whitespace-pre-wrap break-words">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t.chat.thinking}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex gap-2 border-t bg-card p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              disabled={loading}
              className="h-9 rounded-full border-primary/20 text-sm focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-full"
              aria-label={t.chat.send}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
