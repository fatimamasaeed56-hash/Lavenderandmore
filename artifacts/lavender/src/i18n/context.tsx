import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { isLanguage, LANGUAGE_STORAGE_KEY, translate, type Language } from "./messages";

interface I18n {
  language: Language;
  dir: "rtl" | "ltr";
  locale: string;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}
const I18nContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return isLanguage(saved) ? saved : "ar";
    } catch { return "ar"; }
  });
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Storage may be disabled. */ }
  }, [language]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY && isLanguage(event.newValue)) setLanguage(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const value = useMemo<I18n>(() => ({
    language, setLanguage, dir: language === "ar" ? "rtl" : "ltr",
    locale: language === "ar" ? "ar-EG" : "en",
    t: (text) => translate(language, text),
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useLanguage requires LanguageProvider");
  return context;
}