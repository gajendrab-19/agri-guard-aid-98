import { createContext, useContext, useState, ReactNode } from "react";
import { Lang, translations, TranslationShape } from "./translations";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationShape;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
