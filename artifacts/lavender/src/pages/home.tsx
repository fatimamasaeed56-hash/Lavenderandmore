import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Search, ShoppingBag, Menu, X, Plus, Minus, Trash2, Info, ArrowLeft, UserRound } from "lucide-react";
import { Link } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { products, categories, mainCategories, beautyCategories, matchesCategory, formatPrice, formatProductPrice, type Category, type Product } from "@/data/products";
import { useStore, bagProductId, bagColors, bagKey } from "@/hooks/use-store";
import { CategoryFeedback } from "@/components/category-feedback";
import { WhatsAppOrder } from "@/components/whatsapp-order";
import { productVolumeLabel } from "@/data/products";
import { DeliveryLocationPicker, type DeliveryLocation } from "@/components/delivery-location";

const base = import.meta.env.BASE_URL;
const LOGO = `${base}images/logo.jpeg`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 120" className={className} aria-hidden fill="none">
      <path d="M20 118 C20 80 21 50 20 8" stroke="hsl(95 18% 45%)" strokeWidth="1.4" />
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i}>
          <ellipse cx={15} cy={12 + i * 8} rx="4" ry="2.6" transform={`rotate(-35 15 ${12 + i * 8})`} fill="hsl(275 38% 62%)" opacity={0.9 - i * 0.05} />
          <ellipse cx={25} cy={16 + i * 8} rx="4" ry="2.6" transform={`rotate(35 25 ${16 + i * 8})`} fill="hsl(280 35% 55%)" opacity={0.85 - i * 0.05} />
        </g>
      ))}
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 text-primary/60" aria-hidden>
      <span className="h-px w-16 bg-current" />
      <Heart className="h-3 w-3 fill-current" />
      <span className="h-px w-16 bg-current" />
    </div>
  );
}

function ProductCard({ p, fav, onFav, onOpen, onAdd, index }: { p: Product; fav: boolean; onFav: () => void; onOpen: () => void; onAdd: () => void; index: number }) {
  const cat = categories.find((c) => c.id === p.category)?.label;
  return (
    <article className="group reveal" style={{ transitionDelay: `${(index % 4) * 80}ms` }} data-testid={`card-product-${p.id}`}>
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-[0_12px_30px_-24px_hsl(289_32%_30%/0.35)]">
        <button onClick={onOpen} className="block w-full aspect-square p-3 sm:p-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-3px]" aria-label={`عرض تفاصيل ${p.name}`} data-testid={`button-open-${p.id}`}>
          <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain" />
        </button>
        <button onClick={onFav} aria-pressed={fav} aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} className="absolute top-2 left-2 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95" data-testid={`button-fav-${p.id}`}>
          <Heart className={`h-4 w-4 transition-colors ${fav ? "fill-primary text-primary" : "text-primary/70"}`} />
        </button>
      </div>
      <div className="px-2 pt-4 text-center">
        <p className="text-xs tracking-wide text-muted-foreground">{cat}</p>
        <h3 className="font-amiri text-xl text-foreground mt-1">{p.name}</h3>
        {productVolumeLabel(p) && <p className="mt-2 text-sm text-muted-foreground" data-testid={`text-volume-${p.id}`}>{productVolumeLabel(p)}</p>}
        <p className="mt-1 text-sm text-primary" data-testid={`text-price-${p.id}`}>{formatProductPrice(p)}</p>
        {p.perItem && <p className="mt-1 text-xs text-muted-foreground">للقطعة الواحدة، وليس لكل ما في الصورة</p>}
        <button onClick={onAdd} className="mt-3 w-full rounded-xl border border-primary/15 bg-secondary/60 px-2 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary" data-testid={`button-add-${p.id}`}>
          أضيفي إلى الحقيبة
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  useReveal();
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>({ address: "" });
  const { favs, bag, toggleFav, add, setQty, clear } = useStore();
  const [cat, setCat] = useState<Category | "all">(() => {
    const saved = sessionStorage.getItem("lm-feedback-category");
    return categories.some((c) => c.id === saved) ? saved as Category : "all";
  });
  const [q, setQ] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [open, setOpen] = useState<Product | null>(null);
  const [otherColors, setOtherColors] = useState(false);
  const [colors, setColors] = useState("");
  const showProduct = (p: Product) => { setOtherColors(false); setColors(""); setOpen(p); };
  const selectedBagKey = open ? bagKey(open.id, open.category === "flowers" && otherColors ? colors : "") : "";
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pulse, setPulse] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("lm-feedback-category")) {
      sessionStorage.removeItem("lm-feedback-category");
      document.getElementById("feedback-heading")?.scrollIntoView({ block: "center" });
    }
  }, []);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const list = useMemo(() => {
    const t = q.trim();
    return products.filter((p) => matchesCategory(p, cat) && (!onlyFavs || favs.includes(p.id)) && (!t || p.name.includes(t) || p.short.includes(t) || p.description.includes(t)));
  }, [cat, q, onlyFavs, favs]);

  const bagItems = Object.entries(bag).map(([id, n]) => ({ id, p: products.find((x) => x.id === bagProductId(id)), n })).filter((x): x is { id: string; p: Product; n: number } => !!x.p);
  const count = bagItems.reduce((s, x) => s + x.n, 0);
  const bagTotal = bagItems.reduce((s, x) => s + x.n * x.p.price, 0);

  const addToBag = (id: string, n = 1) => { add(id, n); setPulse(true); setTimeout(() => setPulse(false), 600); };
  const goShop = (c?: Category | "all") => { if (c) { setCat(c); setQ(""); } setOnlyFavs(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); };
  const nav: { label: string; act: () => void; children?: typeof beautyCategories }[] = [
    { label: "المتجر", act: () => goShop("all") },
    ...mainCategories.map((c) => ({ label: c.label, act: () => goShop(c.id), children: c.id === "beauty" ? beautyCategories : undefined })),
    { label: "حكايتنا", act: () => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      {/* Header */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? "bg-background/85 backdrop-blur-md shadow-[0_1px_0_hsl(var(--border))]" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-5">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3" data-testid="link-home" aria-label="لافندر آند مور — العودة للأعلى">
            <img src={LOGO} alt="" className="h-9 w-9 sm:h-12 sm:w-12 rounded-full object-cover ring-1 ring-primary/20" />
            <span className="leading-tight text-right">
              <span className="block whitespace-nowrap font-latin text-sm sm:text-xl text-primary" dir="ltr">Lavender &amp; More</span>
            </span>
          </button>
          <nav className="hidden lg:flex items-center gap-8 text-sm" aria-label="التنقل الرئيسي">
            {nav.map((n) => (
              n.children ? (
                <details key={n.label} className="relative">
                  <summary className="cursor-pointer py-1 text-foreground/80 hover:text-primary">{n.label}</summary>
                  <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-primary/15 bg-background p-2 shadow-lg">
                    <button onClick={(e) => { n.act(); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="w-full rounded-xl px-3 py-3 text-right hover:bg-secondary">كل منتجات التجميل</button>
                    {n.children.map((c) => <button key={c.id} onClick={(e) => { goShop(c.id); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="w-full rounded-xl px-3 py-3 text-right hover:bg-secondary">{c.label}</button>)}
                  </div>
                </details>
              ) : <button key={n.label} onClick={n.act} className="relative py-1 text-foreground/80 hover:text-primary after:absolute after:bottom-0 after:right-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full">{n.label}</button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 max-sm:[&>button]:h-8 max-sm:[&>button]:w-8 max-sm:[&>a]:h-8 max-sm:[&>a]:w-8">
            <Link href="/login" className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="تسجيل الدخول أو إنشاء حساب" data-testid="link-account"><UserRound className="h-5 w-5 text-primary" /></Link>
            <button onClick={() => { goShop(); setTimeout(() => searchRef.current?.focus(), 500); }} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="بحث" data-testid="button-search-open"><Search className="h-5 w-5 text-primary" /></button>
            <button onClick={() => { setOnlyFavs(true); setCat("all"); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label={`المفضلة (${favs.length})`} data-testid="button-favs">
              <Heart className="h-5 w-5 text-primary" />
              {favs.length > 0 && <span className="absolute top-1 left-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] text-primary">{favs.length}</span>}
            </button>
            <button onClick={() => setBagOpen(true)} className={`relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary transition-transform ${pulse ? "scale-125" : ""}`} aria-label={`الحقيبة (${count})`} data-testid="button-bag">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {count > 0 && <span className="absolute top-1 left-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground" data-testid="text-bag-count">{count}</span>}
            </button>
            <button onClick={() => setMenuOpen(true)} className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="فتح القائمة" data-testid="button-menu"><Menu className="h-5 w-5 text-primary" /></button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="bg-background border-primary/10 w-[85vw] max-w-sm" dir="rtl">
          <SheetTitle className="font-ruqaa text-2xl text-primary text-right">القائمة</SheetTitle>
          <SheetDescription className="text-right">تنقّلي بين أقسام المتجر</SheetDescription>
          <nav className="mt-8 flex flex-col gap-2" aria-label="قائمة الجوال">
            {nav.map((n) => (
              <div key={n.label}>
                <button onClick={() => { setMenuOpen(false); setTimeout(n.act, 250); }} className="w-full rounded-2xl px-4 py-3 text-right font-amiri text-2xl hover:bg-secondary">{n.label}</button>
                {n.children && <div className="mr-5 border-r border-primary/20 pr-3">{n.children.map((c) => <button key={c.id} onClick={() => { setMenuOpen(false); setTimeout(() => goShop(c.id), 250); }} className="block w-full rounded-xl px-3 py-2 text-right text-sm text-primary hover:bg-secondary">{c.label}</button>)}</div>}
              </div>
            ))}
          </nav>
          <img src={LOGO} alt="" className="mx-auto mt-10 h-32 w-32 rounded-full opacity-80" />
        </SheetContent>
      </Sheet>

      {/* Hero */}
      <section className="relative min-h-[100dvh] pt-24 pb-16">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-accent/50 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[hsl(340_50%_90%)] blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_1fr]">
          <div className="text-center lg:text-right">
            <p className="rise font-latin text-lg text-primary/70" dir="ltr" style={{ animationDelay: "100ms" }}>Once a dream, now a reality.</p>
            <h1 className="rise mt-4 font-ruqaa text-6xl leading-[1.25] text-primary sm:text-7xl lg:text-8xl" style={{ animationDelay: "250ms" }}>كان حلماً<br /><span className="text-[hsl(280_35%_58%)]">وأصبح حقيقة</span></h1>
            <p className="rise mx-auto mt-6 max-w-md text-lg leading-loose text-foreground/75 lg:mx-0" style={{ animationDelay: "450ms" }}>
              أكواب وعطور وهدايا — <span dir="ltr">Lavender &amp; More</span>
            </p>
            <DeliveryLocationPicker value={deliveryLocation} onChange={setDeliveryLocation} />
            <div className="rise mt-10 flex flex-wrap justify-center gap-3 lg:justify-start" style={{ animationDelay: "600ms" }}>
              <button onClick={() => goShop("beauty")} className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-primary-foreground shadow-[0_14px_30px_-12px_hsl(289_32%_36%/0.6)] transition-transform hover:-translate-y-0.5" data-testid="button-hero-shop">
                تسوّقي الجمال <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </button>
              <button onClick={() => goShop("all")} className="rounded-full border border-primary/30 px-8 py-4 text-primary transition-colors hover:bg-secondary" data-testid="button-hero-all">تصفّحي الأقسام</button>
            </div>
          </div>
          <div className="rise relative mx-auto w-full max-w-lg" style={{ animationDelay: "350ms" }}>
            <div className="overflow-hidden rounded-full shadow-[0_40px_80px_-40px_hsl(289_32%_30%/0.6)]">
              <img src={LOGO} alt="Lavender & More — شعار المحل" className="aspect-square w-full object-contain" />
            </div>
            <Sprig className="sway absolute -bottom-6 -right-6 h-40 w-14" />
            <div className="absolute -bottom-8 left-4 rounded-2xl bg-card/95 px-5 py-4 shadow-lg backdrop-blur">
              <p className="font-amiri text-lg text-primary">مغلّفة بشريط</p>
              <p className="text-xs text-muted-foreground">تفاصيل صغيرة لكِ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category ribbon */}
      <section className="border-y border-primary/10 bg-card/60" aria-label="الأقسام">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-5">
          {mainCategories.map((c, i) => (
            <button key={c.id} onClick={() => goShop(c.id)} className={`group px-4 py-8 text-center transition-colors hover:bg-secondary/60 ${i > 0 ? "md:border-r border-primary/10" : ""}`} data-testid={`button-category-${c.id}`}>
              <span className="block font-amiri text-2xl text-primary transition-transform group-hover:-translate-y-1">{c.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{c.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="mx-auto max-w-6xl px-5 py-28">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div className="reveal relative mx-auto">
            <div className="absolute inset-0 -m-6 rounded-full border border-primary/15" aria-hidden />
            <img src={LOGO} alt="شعار لافندر آند مور: أعواد خزامى مربوطة بشريط" className="h-72 w-72 rounded-full object-cover shadow-[0_30px_60px_-30px_hsl(289_32%_30%/0.5)] sm:h-96 sm:w-96" />
          </div>
          <div className="reveal text-center md:text-right">
            <p className="text-sm tracking-widest text-primary/60">حكايتنا</p>
            <h2 className="mt-3 font-ruqaa text-5xl leading-snug text-primary">حزمة خزامى،<br />وشريط، وفكرة</h2>
            <p className="mt-6 text-lg leading-loose text-foreground/75">
              بدأ لافندر آند مور كحلم صغير: مكان يجمع ما تحبينه لنفسك. أكواب لقهوة الصباح، عطور، منتجات تجميل من كوزمتيكس وعناية بالجسم، والورد لتفاصيل يومكِ.
            </p>
            <div className="mt-8"><Divider /></div>
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="scroll-mt-20 bg-gradient-to-b from-transparent via-secondary/40 to-transparent py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center reveal">
            <h2 className="font-ruqaa text-5xl text-primary">{onlyFavs ? "مفضّلاتكِ" : "الرفوف"}</h2>
            <p className="mt-3 text-muted-foreground">اكتشفي الأكواب والعطور ومستحضرات التجميل بصور المحل وأسعارها بالشيكل. الطلب عبر واتساب والدفع عند الاستلام.</p>
          </div>
          <div className="mt-10 flex flex-col items-center gap-5">
            <label className="relative w-full max-w-md">
              <span className="sr-only">ابحثي عن منتج</span>
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
              <input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي: عطر، كوب، لوشن..." className="w-full rounded-full border border-input bg-card py-3.5 pr-11 pl-4 outline-none transition-shadow focus:ring-2 focus:ring-ring/40" data-testid="input-search" />
            </label>
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="تصفية حسب القسم">
              {categories.filter((c) => !c.parent).map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className={`rounded-full px-5 py-2 text-sm transition-all ${cat === c.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-foreground/75 hover:bg-accent/60"}`} data-testid={`filter-${c.id}`}>{c.label}</button>
              ))}
              <button onClick={() => setOnlyFavs((v) => !v)} aria-pressed={onlyFavs} className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm transition-all ${onlyFavs ? "bg-accent text-primary" : "bg-card text-foreground/75 hover:bg-accent/60"}`} data-testid="filter-favs">
                <Heart className={`h-3.5 w-3.5 ${onlyFavs ? "fill-primary" : ""}`} /> المفضلة
              </button>
            </div>
            {(cat === "beauty" || beautyCategories.some((c) => c.id === cat)) && (
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-primary/15 pt-4" role="group" aria-label="أقسام منتجات تجميل">
                <span className="px-2 text-xs text-muted-foreground">منتجات تجميل</span>
                {[{ id: "beauty" as const, label: "كل منتجات التجميل" }, ...beautyCategories].map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className={`rounded-full border border-primary/20 px-4 py-2 text-sm ${cat === c.id ? "bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-secondary"}`} data-testid={`subfilter-${c.id}`}>{c.label}</button>
                ))}
              </div>
            )}
          </div>

          {cat === "printing" ? (
            <div className="mx-auto mt-16 max-w-sm text-center" data-testid="status-printing-coming-soon">
              <h3 className="font-amiri text-3xl text-primary">الطباعة</h3>
              <p dir="ltr" className="mt-4 font-latin text-3xl text-primary">coming soon</p>
            </div>
          ) : list.length === 0 ? (
            <div className="mx-auto mt-16 max-w-sm text-center" data-testid="status-empty">
              <Sprig className="mx-auto h-28 w-10 opacity-70" />
              <p className="mt-4 font-amiri text-2xl text-primary">{onlyFavs && favs.length === 0 ? "لم تختاري مفضّلات بعد" : cat === "flowers" && !q.trim() && !onlyFavs ? "لا توجد منتجات ورد بعد" : "لا توجد منتجات تطابق اختياركِ"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{onlyFavs && favs.length === 0 ? "اضغطي على القلب فوق أي منتج ليظهر هنا." : cat === "flowers" && !q.trim() && !onlyFavs ? "لم تُضف منتجات إلى هذا القسم بعد. تصفّحي بقية الأقسام." : "جرّبي كلمة أخرى أو غيّري التصفية لعرض المنتجات."}</p>
              <button onClick={() => { setQ(""); setCat("all"); setOnlyFavs(false); }} className="mt-6 rounded-full border border-primary/30 px-6 py-2.5 text-sm text-primary hover:bg-secondary" data-testid="button-reset-filters">عرض كل المنتجات</button>
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p, i) => (
                <ProductCard key={p.id} index={i} p={p} fav={favs.includes(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => showProduct(p)} onAdd={() => p.category === "flowers" ? showProduct(p) : addToBag(p.id)} />
              ))}
            </div>
          )}
          {cat !== "all" && <CategoryFeedback key={cat} category={cat} />}
        </div>
      </section>

      <div id="customer-feedback" className="mx-auto max-w-6xl px-5 pb-24">
        <CategoryFeedback category="all" />
      </div>

      {/* Rituals */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <div className="text-center reveal"><h2 className="font-ruqaa text-4xl text-primary">كيف نفكّر في كل قطعة</h2><div className="mt-5"><Divider /></div></div>
        <ol className="mt-14 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          {[
            ["١", "نختار", "قطعاً قليلة نحبها بدل رفوف مزدحمة."],
            ["٢", "نغلّف", "بورق ناعم وشريط، ونهتم بأصغر التفاصيل."],
            ["٣", "نكمل", "بوردة أو كوب، لتفاصيل يومكِ الصغيرة."],
          ].map(([n, t, d], i) => (
            <li key={n} className="reveal border-t border-primary/20 pt-6" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="font-amiri text-5xl text-accent-foreground/30">{n}</span>
              <h3 className="mt-2 font-amiri text-2xl text-primary">{t}</h3>
              <p className="mt-2 text-foreground/70 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-card/70 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center">
          <img src={LOGO} alt="" className="h-20 w-20 rounded-full" />
          <p className="font-latin text-2xl text-primary" dir="ltr">Lavender &amp; More</p>
          <p className="font-latin text-muted-foreground" dir="ltr">Once a dream, now a reality.</p>
          <p className="text-primary">موقعنا فلسطين — متوفر التوصيل</p>
          <p className="text-sm text-muted-foreground">للتواصل والاستفسار عبر واتساب</p>
          <a href="https://wa.me/972593860029" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full border border-primary/20 px-6 py-3 text-primary transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label="تواصل معنا على واتساب على الرقم +972593860029" data-testid="footer-whatsapp">
            <FaWhatsapp className="h-6 w-6 text-[#128C7E]" aria-hidden="true" />
            <span dir="ltr">+972593860029</span>
          </a>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">الأسعار بالشيكل. الطلب عبر واتساب والدفع عند الاستلام. يُؤكَّد توفر المنتجات ورسوم التوصيل عبر المحادثة.</p>
          <p className="text-xs text-muted-foreground">جميع الحقوق محفوظة — <span dir="ltr">Lavender &amp; More · 2026@</span></p>
        </div>
      </footer>

      {/* Product dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto rounded-[32px] border-primary/10 bg-background p-0 [&>button]:left-4 [&>button]:right-auto" dir="rtl">
          {open && (
            <div className="grid md:grid-cols-2">
              <img src={open.image} alt={open.name} className={`h-64 w-full ${open.actualPrice || open.suppliedPhoto ? "object-contain" : "object-cover"} md:h-full`} />
              <div className="p-8 text-right">
                <p className="text-xs text-muted-foreground">{categories.find((c) => c.id === open.category)?.label}</p>
                <DialogTitle className="mt-1 font-amiri text-3xl font-normal text-primary">{open.name}</DialogTitle>
                <DialogDescription className="mt-4 leading-loose text-foreground/75">{open.description}</DialogDescription>
                {productVolumeLabel(open) && <p className="mt-3 text-sm text-primary">{productVolumeLabel(open)}</p>}
                <ul className="mt-5 flex flex-wrap gap-2">{open.notes.map((n) => <li key={n} className="rounded-full bg-secondary px-3 py-1 text-xs text-primary">{n}</li>)}</ul>
                <p className="mt-6 text-2xl text-primary">{formatProductPrice(open)}</p>
                {open.category === "flowers" && <div className="mt-5 rounded-2xl border border-primary/20 bg-secondary/40 p-4">
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={otherColors} onChange={(e) => setOtherColors(e.target.checked)} className="h-4 w-4 accent-primary" data-testid="checkbox-other-colors" />
                    أريد ألواناً أخرى
                  </label>
                  {otherColors && <label className="mt-4 block text-sm">
                    الألوان المطلوبة
                    <textarea value={colors} onChange={(e) => setColors(e.target.value)} maxLength={200} rows={2} placeholder="مثلاً: ورد أبيض وبنفسجي وتغليف زهري" className="mt-2 w-full rounded-xl border border-input bg-background p-3 focus:ring-2 focus:ring-primary/30" data-testid="input-flower-colors" />
                    <span className="mt-1 block text-xs text-muted-foreground">اكتبي الألوان قبل إضافة الباقة إلى الحقيبة.</span>
                  </label>}
                </div>}
                <div className="mt-6 flex gap-3">
                  <button onClick={() => addToBag(selectedBagKey)} disabled={open.category === "flowers" && otherColors && !colors.trim()} className="flex-1 rounded-full bg-primary py-3.5 text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50" data-testid="button-dialog-add">
                    {bag[selectedBagKey] ? `في الحقيبة (${bag[selectedBagKey]}) — أضيفي واحدة` : "أضيفي إلى الحقيبة"}
                  </button>
                  <button onClick={() => toggleFav(open.id)} aria-pressed={favs.includes(open.id)} aria-label="المفضلة" className="grid h-12 w-12 place-items-center rounded-full border border-primary/30 hover:bg-secondary" data-testid="button-dialog-fav">
                    <Heart className={`h-5 w-5 ${favs.includes(open.id) ? "fill-primary text-primary" : "text-primary"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bag */}
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent side="left" className="flex w-[92vw] max-w-md flex-col bg-background border-primary/10 p-0 data-[state=open]:animate-none [&>button]:left-4 [&>button]:right-auto" style={{ left: 0, right: "auto", transform: "none", translate: "none" }} dir="rtl">
          <div className="border-b border-primary/10 p-6 text-right">
            <SheetTitle className="font-ruqaa text-3xl text-primary">حقيبتكِ</SheetTitle>
            <SheetDescription>{count ? `${count.toLocaleString("ar-EG")} قطعة` : "فارغة حالياً"}</SheetDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6">
            {bagItems.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-primary/40" />
                <p className="mt-4 font-amiri text-xl text-primary">الحقيبة تنتظر أول قطعة</p>
                <button onClick={() => { setBagOpen(false); goShop("all"); }} className="mt-6 rounded-full border border-primary/30 px-6 py-2.5 text-sm text-primary hover:bg-secondary" data-testid="button-bag-browse">تصفّحي المتجر</button>
              </div>
            ) : (
              <><ul className="space-y-5">
                {bagItems.map(({ id, p, n }) => (
                  <li key={id} className="flex gap-4" data-testid={`row-bag-${p.id}`}>
                    <img src={p.image} alt="" className={`h-24 w-20 rounded-2xl ${p.actualPrice || p.suppliedPhoto ? "object-contain" : "object-cover"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-amiri text-lg leading-tight">{p.name}</p>
                        <button onClick={() => setQty(id, 0)} aria-label={`إزالة ${p.name}`} className="text-muted-foreground hover:text-destructive" data-testid={`button-remove-${p.id}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <p className="text-sm text-primary">{formatProductPrice(p, n)}</p>
                      {productVolumeLabel(p) && <p className="mt-1 text-xs text-muted-foreground">{productVolumeLabel(p)}</p>}
                      {p.category === "flowers" && <p className="mt-1 break-words text-xs text-muted-foreground">{bagColors(id) ? `الألوان المطلوبة: ${bagColors(id)}` : "الألوان كما في الصورة"}</p>}
                      {p.perItem && <p className="mt-1 text-xs text-muted-foreground">الكمية بالقطعة، وليست مجموعات الصور</p>}
                      <div className="mt-2 inline-flex items-center rounded-full border border-primary/20">
                        <button onClick={() => setQty(id, n + 1)} aria-label="زيادة الكمية" className="grid h-8 w-8 place-items-center hover:text-primary" data-testid={`button-inc-${p.id}`}><Plus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm" aria-live="polite">{n.toLocaleString("ar-EG")}</span>
                        <button onClick={() => setQty(id, n - 1)} aria-label="إنقاص الكمية" className="grid h-8 w-8 place-items-center hover:text-primary" data-testid={`button-dec-${p.id}`}><Minus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul><WhatsAppOrder items={bagItems} location={deliveryLocation} /></>
            )}
          </div>
          <div className="shrink-0 border-t border-primary/10 bg-card/70 p-6">
            <div className="flex items-center justify-between font-amiri text-xl"><span>مجموع المنتجات</span><span className="text-primary" data-testid="text-bag-total">{formatPrice(bagTotal)} شيكل</span></div>
            <div className="mt-4 flex gap-3 rounded-2xl bg-secondary p-4 text-sm leading-relaxed text-foreground/80" role="note">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>الدفع عند الاستلام. المجموع لا يشمل التوصيل؛ تُحدَّد رسومه ويُؤكَّد الطلب عبر واتساب. الحقيبة محفوظة على جهازكِ.</p>
            </div>
            {bagItems.length > 0 && <button onClick={clear} className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive" data-testid="button-clear-bag"><X className="h-3.5 w-3.5" /> إفراغ الحقيبة</button>}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
