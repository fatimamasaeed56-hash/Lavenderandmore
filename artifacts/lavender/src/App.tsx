import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import AuthPage from '@/pages/auth';
import { useLanguage } from '@/i18n/context';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function PageMetadata() {
  const [path] = useLocation();
  const { t, language } = useLanguage();
  const title = path === "/login" ? `${t("تسجيل الدخول")} — ${t("لافندر آند مور")}`
    : path === "/signup" ? `${t("إنشاء حساب")} — ${t("لافندر آند مور")}`
    : path === "/" ? t("لافندر آند مور | أكواب، عطور، منتجات تجميل والورد")
    : `${t("الصفحة غير موجودة")} — ${t("لافندر آند مور")}`;
  return <>
    <title>{title}</title>
    <meta name="description" content={t("لافندر آند مور — أكواب، عطور، منتجات تجميل تشمل كوزمتيكس وعناية بالجسم، والورد. كان حلماً، وأصبح حقيقة.")} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={t("أكواب، عطور، منتجات تجميل تشمل كوزمتيكس وعناية بالجسم، والورد.")} />
    <meta property="og:locale" content={language === "ar" ? "ar_AR" : "en_US"} />
  </>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <PageMetadata />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login">{() => <AuthPage mode="login" />}</Route>
        <Route path="/signup">{() => <AuthPage mode="signup" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
