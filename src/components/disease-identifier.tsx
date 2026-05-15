import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, ImageIcon, Microscope } from "lucide-react";

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/12vSza3Ch/";

type Prediction = { className: string; probability: number };

export function DiseaseIdentifier() {
  const { t } = useLang();
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  async function ensureModel() {
    if (modelRef.current) return modelRef.current;
    setLoadingModel(true);
    try {
      const tmImage = await import("@teachablemachine/image");
      const model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
      modelRef.current = model;
      return model;
    } finally {
      setLoadingModel(false);
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setPredictions(null);
    const url = URL.createObjectURL(file);
    setImgUrl(url);
  }

  useEffect(() => {
    if (!imgUrl) return;
    const img = imgRef.current;
    if (!img) return;

    const run = async () => {
      try {
        setAnalyzing(true);
        const model = await ensureModel();
        if (!img.complete) {
          await new Promise((r) => (img.onload = r));
        }
        const preds: Prediction[] = await model.predict(img);
        preds.sort((a, b) => b.probability - a.probability);
        setPredictions(preds);
      } catch (e) {
        console.error(e);
        setError("Failed to analyze image. Please try again.");
      } finally {
        setAnalyzing(false);
      }
    };
    run();
  }, [imgUrl]);

  const top = predictions?.[0];

  return (
    <section id="diagnose" className="bg-gradient-to-b from-background to-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Microscope className="h-3.5 w-3.5" /> AI Diagnosis
          </div>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t.diagnose.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.diagnose.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden p-6 shadow-[var(--shadow-card)]">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {!imgUrl ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 transition-colors hover:bg-primary/10"
              >
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-4 font-semibold">{t.diagnose.upload}</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </button>
            ) : (
              <div>
                <div className="overflow-hidden rounded-2xl bg-muted">
                  <img
                    ref={imgRef}
                    src={imgUrl}
                    alt="Plant"
                    crossOrigin="anonymous"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <Button
                  onClick={() => inputRef.current?.click()}
                  variant="outline"
                  className="mt-4 w-full rounded-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {t.diagnose.change}
                </Button>
              </div>
            )}
          </Card>

          <Card className="flex flex-col p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-xl font-bold">{t.diagnose.result}</h3>
            <div className="mt-4 flex-1">
              {loadingModel || analyzing ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm">
                    {loadingModel ? t.diagnose.loadingModel : t.diagnose.analyzing}
                  </p>
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : top ? (
                <div className="space-y-5">
                  <div>
                    <div className="text-sm text-muted-foreground">{t.diagnose.result}</div>
                    <div className="mt-1 text-2xl font-bold text-primary">{top.className}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={top.probability * 100} className="h-2 flex-1" />
                      <span className="text-sm font-semibold tabular-nums">
                        {(top.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Show only the next 2 highest confidence results */}
                  {predictions && predictions.length > 1 && (
                    <div className="space-y-2 border-t pt-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.diagnose.confidence}
                      </div>
                      {predictions.slice(1, 3).map((p) => (
                        <div key={p.className} className="flex items-center gap-3 text-sm">
                          <span className="flex-1 truncate">{p.className}</span>
                          <div className="w-32">
                            <Progress value={p.probability * 100} className="h-1.5" />
                          </div>
                          <span className="w-12 text-right tabular-nums text-muted-foreground">
                            {(p.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
                  {t.diagnose.noResult}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
