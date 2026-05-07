import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/lib/language-context";
import { askExpert } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bot, User, MessageCircle } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatBot() {
  const { t, lang } = useLang();
  const ask = useServerFn(askExpert);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Reset welcome when language changes
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
      const res = await ask({
        data: { message: text, lang, history: messages.slice(-8) },
      });
      if (res.error) {
        setMessages([...newMsgs, { role: "assistant", content: `⚠️ ${res.error}` }]);
      } else {
        setMessages([...newMsgs, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      setMessages([...newMsgs, { role: "assistant", content: "⚠️ Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const displayMessages: Msg[] =
    messages.length === 0 ? [{ role: "assistant", content: t.chat.welcome }] : messages;

  return (
    <section id="chat" className="py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MessageCircle className="h-3.5 w-3.5" /> AI Chat
          </div>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t.chat.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.chat.subtitle}</p>
        </div>

        <Card className="overflow-hidden border-primary/10 shadow-[var(--shadow-card)]">
          <div ref={scrollRef} className="h-[460px] space-y-4 overflow-y-auto p-5 md:p-6">
            {displayMessages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-primary"
                  }`}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.chat.thinking}
                </div>
              </div>
            )}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t bg-card p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              disabled={loading}
              className="rounded-full border-primary/20 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="gap-2 rounded-full"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{t.chat.send}</span>
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
