import { useLanguage } from "@/i18n/context";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const target = language === "ar" ? "en" : "ar";
  return (
    <button type="button" onClick={() => setLanguage(target)} lang={target} dir={target === "ar" ? "rtl" : "ltr"}
      aria-label={language === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"}
      title={language === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"}
      className="inline-flex h-9 min-w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background/80 px-2 text-xs font-semibold text-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      data-testid="button-language-switch">
      {language === "ar" ? "EN" : "عربي"}
    </button>
  );
}