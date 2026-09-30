import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Heart, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

const logo = `${import.meta.env.BASE_URL}images/logo.jpeg`;
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  function continueSecurely(action: () => void) {
    setError("");
    try {
      action();
    } catch {
      setError("تعذّر فتح الصفحة الآمنة. حاولي مرة أخرى.");
    }
  }

  return (
    <main dir="rtl" lang="ar" className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 h-[480px] w-[480px] rounded-full bg-accent/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 h-[440px] w-[440px] rounded-full bg-secondary/70 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href="/" className={`font-latin text-xl text-primary sm:text-2xl ${focus}`} dir="ltr" aria-label="لافندر آند مور — المتجر">
          Lavender &amp; More
        </Link>
        <Link href="/" className={`inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-primary ${focus}`}>
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
          العودة للمتجر
        </Link>
      </header>

      <div className="relative mx-auto grid w-full max-w-5xl flex-1 items-center gap-9 px-5 py-8 md:grid-cols-[1fr_1.05fr] md:gap-16 md:py-14">
        <section className="rise text-center" aria-label="لافندر آند مور">
          <div className="relative mx-auto w-40 sm:w-52 md:w-full md:max-w-[340px]">
            <div aria-hidden="true" className="absolute -inset-3 rounded-full border border-primary/15 md:-inset-5" />
            <img src={logo} alt="شعار لافندر آند مور" className="aspect-square w-full rounded-full object-contain shadow-[0_30px_65px_-35px_hsl(289_32%_30%/0.45)]" />
          </div>
          <p className="mt-8 font-ruqaa text-3xl leading-relaxed text-primary md:mt-12 md:text-4xl">تفاصيل صغيرة، تشبهكِ</p>
          <p className="mx-auto mt-3 hidden max-w-xs text-sm leading-loose text-muted-foreground md:block">
            أكواب، عطور، جمال وورد.<br />كل قطعة نختارها كأنها لكِ.
          </p>
        </section>

        <section aria-labelledby="auth-heading" aria-busy={isLoading} className="rise rounded-[32px] border border-primary/15 bg-card/85 px-6 py-8 shadow-[0_24px_65px_-40px_hsl(289_32%_30%/0.35)] sm:px-10 sm:py-10" style={{ animationDelay: "120ms" }}>
          {isLoading ? (
            <div role="status" className="py-8">
              <h1 id="auth-heading" className="sr-only">جارٍ التحقق من حسابكِ</h1>
              <span className="sr-only">يرجى الانتظار</span>
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
              <p className="mt-6 text-sm text-muted-foreground">تم تسجيل دخولكِ</p>
              <h1 id="auth-heading" className="mt-2 break-words font-amiri text-4xl leading-relaxed text-primary">
                أهلاً بكِ{user?.firstName ? <>، <bdi>{user.firstName}</bdi></> : " من جديد"}
              </h1>
              <p className="mt-3 text-sm leading-loose text-muted-foreground">يسعدنا وجودكِ هنا. عودي إلى الرفوف واكتشفي ما تحبينه.</p>
              <Link href="/" className={`mt-8 flex min-h-14 items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-primary-foreground transition-transform motion-safe:hover:-translate-y-0.5 ${focus}`}>
                العودة للتسوّق <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => continueSecurely(logout)} className={`mx-auto mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm text-primary ${focus}`} data-testid="button-auth-logout">
                <LogOut className="h-4 w-4" aria-hidden="true" /> تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <nav aria-label="خيارات الحساب" className="mb-8 grid grid-cols-2 rounded-full border border-primary/10 bg-secondary/60 p-1">
                {([{ path: "/login", label: "تسجيل الدخول", active: !isSignup }, { path: "/signup", label: "إنشاء حساب", active: isSignup }]).map(({ path, label, active }) => (
                  <Link key={path} href={path} aria-current={active ? "page" : undefined} className={`rounded-full px-3 py-3 text-center text-sm ${active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-card/70"} ${focus}`}>{label}</Link>
                ))}
              </nav>
              <p className="text-sm text-muted-foreground">{isSignup ? "بداية جميلة مع لافندر" : "مكانكِ بين تفاصيلنا"}</p>
              <h1 id="auth-heading" className="mt-2 font-amiri text-4xl leading-relaxed text-primary">{isSignup ? "أهلاً بكِ في عالمنا" : "أهلاً بعودتكِ"}</h1>
              <p id="auth-explanation" className="mt-4 text-sm leading-loose text-foreground/80">
                {isSignup ? "لإنشاء حسابكِ، تابعي إلى شاشة المصادقة الآمنة. يمكنكِ هناك إنشاء حساب جديد أو تسجيل الدخول إلى حساب موجود." : "للدخول إلى حسابكِ، تابعي إلى شاشة المصادقة الآمنة. يمكنكِ هناك تسجيل الدخول أو إنشاء حساب جديد."}
              </p>
              <button type="button" onClick={() => continueSecurely(login)} aria-describedby="auth-explanation" className={`mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-4 text-primary-foreground shadow-[0_14px_30px_-16px_hsl(289_32%_36%/0.5)] transition-transform motion-safe:hover:-translate-y-0.5 ${focus}`} data-testid="button-auth-continue">
                <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
                {isSignup ? "المتابعة لإنشاء حساب" : "المتابعة لتسجيل الدخول"}
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
              <p className="mt-4 text-center text-xs leading-loose text-muted-foreground">لن يُطلب منكِ إدخال كلمة مرور في هذه الصفحة.</p>
              <div className="mt-7 border-t border-primary/10 pt-5 text-center text-sm leading-loose">
                <span className="text-muted-foreground">{isSignup ? "لديكِ حساب بالفعل؟ " : "هذه زيارتكِ الأولى؟ "}</span>
                <Link href={isSignup ? "/login" : "/signup"} className={`rounded text-primary underline decoration-primary/30 underline-offset-4 ${focus}`}>{isSignup ? "تسجيل الدخول" : "إنشاء حساب"}</Link>
              </div>
            </>
          )}
          {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-relaxed text-destructive">{error}</p>}
        </section>
      </div>

      <footer className="relative px-5 pb-7 pt-6 text-center">
        <div aria-hidden="true" className="mb-4 flex items-center justify-center gap-3 text-primary/40"><span className="h-px w-10 bg-current" /><Heart className="h-3 w-3" /><span className="h-px w-10 bg-current" /></div>
        <p className="font-latin text-lg text-primary/75" dir="ltr">Once a dream, now a reality.</p>
      </footer>
    </main>
  );
}