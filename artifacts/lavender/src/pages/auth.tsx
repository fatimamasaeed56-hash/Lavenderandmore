import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Heart, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLanguage } from "@/i18n/context";
import { LanguageSwitch } from "@/components/language-switch";

const logo = `${import.meta.env.BASE_URL}images/logo.jpeg`;
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { t, language, dir } = useLanguage();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    setError("");
    setPassword("");
    setConfirmation("");
    setShowPassword(false);
  }, [mode]);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || password.length < 10 || password.length > 128) {
      setError("أدخلي بريداً إلكترونياً صحيحاً وكلمة مرور من 10 إلى 128 حرفاً.");
      return;
    }
    if (isSignup && password !== confirmation) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch(isSignup ? "/api/auth/register" : "/api/auth/password-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.ok) {
        const messages: Record<number, string> = {
          400: "أدخلي بريداً إلكترونياً صحيحاً وكلمة مرور من 10 إلى 128 حرفاً.",
          401: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
          409: "هذا البريد مرتبط بحساب موجود. استخدمي طريقة الدخول الحالية لهذا الحساب؛ لا يتم ربط الحسابات تلقائياً.",
          429: "محاولات كثيرة. انتظري قليلاً ثم حاولي مجدداً.",
        };
        setError(messages[response.status] ?? "تعذّر إكمال العملية. تحقّقي من الاتصال وحاولي مرة أخرى.");
        return;
      }
      setPassword("");
      setConfirmation("");
      window.location.assign(import.meta.env.BASE_URL);
    } catch {
      setError("تعذّر إكمال العملية. تحقّقي من الاتصال وحاولي مرة أخرى.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function continueSecurely(action: () => void) {
    if (submitting.current) return;
    setError("");
    try {
      action();
    } catch {
      setError("تعذّر فتح صفحة الدخول. اسمحي بفتح النوافذ المنبثقة لهذا الموقع ثم حاولي مجدداً.");
    }
  }

  return (
    <main dir={dir} lang={language} className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 h-[480px] w-[480px] rounded-full bg-accent/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 h-[440px] w-[440px] rounded-full bg-secondary/70 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
         <Link href="/" className={`min-w-0 font-latin text-xl text-primary sm:text-2xl ${focus}`} dir="ltr" aria-label={t("لافندر آند مور — المتجر")}>
          Lavender &amp; More
        </Link>
         <div className="flex shrink-0 items-center gap-2">
         <LanguageSwitch />
         <Link href="/" aria-label={t("العودة للمتجر")} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-primary ${focus}`}>
           <ArrowRight aria-hidden="true" className="h-4 w-4 ltr:rotate-180" />
           <span className="max-[359px]:sr-only">{t("العودة للمتجر")}</span>
        </Link>
         </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-5xl flex-1 items-center gap-9 px-5 py-8 md:grid-cols-[1fr_1.05fr] md:gap-16 md:py-14">
         <section className="rise text-center" aria-label={t("لافندر آند مور")}>
          <div className="relative mx-auto w-40 sm:w-52 md:w-full md:max-w-[340px]">
            <div aria-hidden="true" className="absolute -inset-3 rounded-full border border-primary/15 md:-inset-5" />
             <img src={logo} alt={t("شعار لافندر آند مور")} className="aspect-square w-full rounded-full object-contain shadow-[0_30px_65px_-35px_hsl(289_32%_30%/0.45)]" />
          </div>
           <p className="mt-8 font-ruqaa text-3xl leading-relaxed text-primary md:mt-12 md:text-4xl">{t("تفاصيل صغيرة، تشبهكِ")}</p>
          <p className="mx-auto mt-3 hidden max-w-xs text-sm leading-loose text-muted-foreground md:block">
             {t("أكواب، عطور، جمال وورد.")}<br />{t("كل قطعة نختارها كأنها لكِ.")}
          </p>
        </section>

        <section aria-labelledby="auth-heading" aria-busy={isLoading || pending} className="rise rounded-[32px] border border-primary/15 bg-card/85 px-6 py-8 shadow-[0_24px_65px_-40px_hsl(289_32%_30%/0.35)] sm:px-10 sm:py-10" style={{ animationDelay: "120ms" }}>
          {isLoading ? (
            <div role="status" className="py-8">
               <h1 id="auth-heading" className="sr-only">{t("جارٍ التحقق من حسابكِ")}</h1>
               <span className="sr-only">{t("يرجى الانتظار")}</span>
              <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
                <div className="h-12 w-12 rounded-full bg-secondary" />
                <div className="h-9 w-2/3 rounded-lg bg-secondary" />
                <div className="h-4 w-full rounded bg-secondary" />
                <div className="h-4 w-4/5 rounded bg-secondary" />
                <div className="h-14 w-full rounded-full bg-secondary" />
              </div>
            </div>
          ) : isAuthenticated ? (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
               <p className="mt-6 text-sm text-muted-foreground">{t("تم تسجيل دخولكِ")}</p>
              <h1 id="auth-heading" className="mt-2 break-words font-amiri text-4xl leading-relaxed text-primary">
                 {t("أهلاً بكِ")}{user?.firstName ? <>{language === "ar" ? "، " : ", "}<bdi>{user.firstName}</bdi></> : t(" من جديد")}
              </h1>
               <p className="mt-3 text-sm leading-loose text-muted-foreground">{t("يسعدنا وجودكِ هنا. عودي إلى الرفوف واكتشفي ما تحبينه.")}</p>
              <Link href="/" className={`mt-8 flex min-h-14 items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-primary-foreground transition-transform motion-safe:hover:-translate-y-0.5 ${focus}`}>
                 {t("العودة للتسوّق")} <ArrowLeft className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => continueSecurely(logout)} className={`mx-auto mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm text-primary ${focus}`} data-testid="button-auth-logout">
                 <LogOut className="h-4 w-4" aria-hidden="true" /> {t("تسجيل الخروج")}
              </button>
            </>
          ) : (
            <>
               <nav aria-label={t("خيارات الحساب")} className="mb-8 grid grid-cols-2 rounded-full border border-primary/10 bg-secondary/60 p-1">
                {([{ path: "/login", label: "تسجيل الدخول", active: !isSignup }, { path: "/signup", label: "إنشاء حساب", active: isSignup }]).map(({ path, label, active }) => (
                   <Link key={path} href={path} aria-disabled={pending} onClick={(event) => { if (submitting.current) event.preventDefault(); }} aria-current={active ? "page" : undefined} className={`rounded-full px-3 py-3 text-center text-sm ${active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-card/70"} ${focus}`}>{t(label)}</Link>
                ))}
              </nav>
               <p className="text-sm text-muted-foreground">{t(isSignup ? "بداية جميلة مع لافندر" : "مكانكِ بين تفاصيلنا")}</p>
               <h1 id="auth-heading" className="mt-2 font-amiri text-4xl leading-relaxed text-primary">{t(isSignup ? "أهلاً بكِ في عالمنا" : "أهلاً بعودتكِ")}</h1>
              <p id="auth-explanation" className="mt-4 text-sm leading-loose text-foreground/80">
                 {t("استخدمي بريدكِ وكلمة مرور خاصة بالمتجر، وليست كلمة مرور بريدكِ الإلكتروني.")}
              </p>
              <form onSubmit={submitCredentials} noValidate className="mt-6 space-y-4" aria-describedby="auth-explanation auth-session">
                <fieldset disabled={pending} className="space-y-4 disabled:opacity-65">
                  <div className="space-y-2">
                    <label htmlFor="auth-email" className="block text-sm text-primary">{t("البريد الإلكتروني")}</label>
                    <input id="auth-email" name="email" type="email" autoComplete="email" dir="ltr" required value={email} onChange={(event) => setEmail(event.target.value)} className={`min-h-12 w-full rounded-xl border border-primary/20 bg-background/70 px-4 text-sm ${focus}`} data-testid="input-auth-email" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="auth-password" className="block text-sm text-primary">{t("كلمة مرور المتجر")}</label>
                    <div className="relative">
                      <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} dir="ltr" required minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="auth-password-hint" className={`min-h-12 w-full rounded-xl border border-primary/20 bg-background/70 px-4 pe-14 text-sm ${focus}`} data-testid="input-auth-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={t(showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور")} aria-pressed={showPassword} className={`absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-primary ${focus}`} data-testid="button-auth-password-visibility">
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                    <p id="auth-password-hint" className="text-xs leading-loose text-muted-foreground">{t("من 10 إلى 128 حرفاً.")}</p>
                  </div>
                  {isSignup && <div className="space-y-2">
                    <label htmlFor="auth-confirmation" className="block text-sm text-primary">{t("تأكيد كلمة المرور")}</label>
                    <input id="auth-confirmation" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" dir="ltr" required minLength={10} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={`min-h-12 w-full rounded-xl border border-primary/20 bg-background/70 px-4 text-sm ${focus}`} data-testid="input-auth-confirmation" />
                  </div>}
                  <button type="submit" disabled={pending} className={`flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-4 text-primary-foreground transition-transform motion-safe:enabled:hover:-translate-y-0.5 disabled:cursor-wait ${focus}`} data-testid="button-auth-password-submit">
                    <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                    <span role="status">{t(pending ? "جارٍ المتابعة…" : isSignup ? "إنشاء حساب" : "تسجيل الدخول")}</span>
                  </button>
                </fieldset>
              </form>
              <p id="auth-session" className="mt-4 text-center text-xs leading-loose text-muted-foreground">{t("يبقى تسجيل دخولكِ محفوظاً لمدة 30 يوماً على هذا الجهاز. سجّلي الخروج إذا كان الجهاز مشتركاً.")}</p>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-primary/15" /><span>{t("أو")}</span><span className="h-px flex-1 bg-primary/15" /></div>
              <button type="button" disabled={pending} onClick={() => continueSecurely(login)} aria-describedby="auth-provider-explanation" className={`flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-primary/25 px-5 py-3 text-primary transition-transform motion-safe:enabled:hover:-translate-y-0.5 disabled:opacity-50 ${focus}`} data-testid="button-auth-continue">
                <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
                 {t("المتابعة عبر خدمة تسجيل الدخول")}
                 <ArrowLeft className="h-4 w-4 shrink-0 ltr:rotate-180" aria-hidden="true" />
              </button>
               <p id="auth-provider-explanation" className="mt-3 text-center text-xs leading-loose text-muted-foreground">{t("لحسابات خدمة الدخول الحالية، تابعي بالطريقة نفسها. في المعاينة قد تُفتح صفحة الدخول في تبويب جديد.")}</p>
              <div className="mt-7 border-t border-primary/10 pt-5 text-center text-sm leading-loose">
                 <span className="text-muted-foreground">{t(isSignup ? "لديكِ حساب بالفعل؟ " : "هذه زيارتكِ الأولى؟ ")}</span>
                 <Link href={isSignup ? "/login" : "/signup"} aria-disabled={pending} onClick={(event) => { if (submitting.current) event.preventDefault(); }} className={`rounded text-primary underline decoration-primary/30 underline-offset-4 ${focus}`}>{t(isSignup ? "تسجيل الدخول" : "إنشاء حساب")}</Link>
              </div>
            </>
          )}
           {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-relaxed text-destructive">{t(error)}</p>}
        </section>
      </div>

      <footer className="relative px-5 pb-7 pt-6 text-center">
        <div aria-hidden="true" className="mb-4 flex items-center justify-center gap-3 text-primary/40"><span className="h-px w-10 bg-current" /><Heart className="h-3 w-3" /><span className="h-px w-10 bg-current" /></div>
        <p className="font-latin text-lg text-primary/75" dir="ltr">Once a dream, now a reality.</p>
      </footer>
    </main>
  );
}