import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { ImagePlus, MessageCircle, Trash2, X } from "lucide-react";
import { type Category } from "@/data/products";
import { localizedCategories } from "@/data/localized-products";
import { useLanguage } from "@/i18n/context";
import { english } from "@/i18n/messages";

interface Feedback {
  id: string;
  category: Category;
  authorName: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
  canDelete: boolean;
}

const api = `${import.meta.env.BASE_URL}api/feedback`;
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const message = res.status === 401 ? "سجّلي الدخول أولاً لإرسال رأيكِ." : res.status === 429 ? "وصلتِ إلى الحد المسموح. حاولي لاحقاً." : "تعذّر إكمال العملية. تحقّقي من الاتصال وحاولي مرة أخرى.";
    throw new Error(message);
  }
  return res.status === 204 ? undefined as T : res.json();
}

export function CategoryFeedback({ category }: { category: Category | "all" }) {
  const { t, language, locale } = useLanguage();
  const categories = localizedCategories(language);
  const [selected, setSelected] = useState<Category>(category === "all" ? "cups" : category);
  const activeCategory = category === "all" ? selected : category;
  const label = categories.find((c) => c.id === activeCategory)?.label;
  const headingId = category === "all" ? "feedback-heading" : `feedback-heading-${category}`;
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const client = useQueryClient();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const feedback = useQuery({
    queryKey: ["feedback", category, user?.id],
    queryFn: () => request<{ items: Feedback[] }>(category === "all" ? api : `${api}?category=${category}`),
    staleTime: 0,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const removePhoto = () => {
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };
  const submit = useMutation({
    mutationFn: async () => {
      let imagePath: string | undefined;
      if (file) {
        const upload = await request<{ uploadURL: string; objectPath: string }>(`${api}/upload`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: file.type, size: file.size }),
        });
        const result = await fetch(upload.uploadURL, {
          method: "PUT", headers: { "Content-Type": file.type }, body: file,
        });
        if (!result.ok) throw new Error("تعذّر رفع الصورة. حاولي مرة أخرى.");
        imagePath = upload.objectPath;
      }
      return request<Feedback>(api, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory, text: text.trim(), imagePath }),
      });
    },
    onSuccess: () => {
      setText(""); removePhoto(); setSuccess("شكراً لكِ! تم نشر رأيكِ.");
      void client.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (err: Error) => setError(english[err.message] ? err.message : "تعذّر إكمال العملية. تحقّقي من الاتصال وحاولي مرة أخرى."),
  });
  async function deleteFeedback(id: string) {
    if (!window.confirm(t("هل تريدين حذف رأيكِ وصورته؟"))) return;
    setDeleting(id); setError(""); setSuccess("");
    try {
      await request(`${api}/${id}`, { method: "DELETE" });
      await client.invalidateQueries({ queryKey: ["feedback"] });
      setSuccess("تم حذف رأيكِ.");
    } catch (err) {
      setError(err instanceof Error && english[err.message] ? err.message : "تعذّر الحذف.");
    } finally { setDeleting(null); }
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setSuccess("");
    if (text.trim().length < 3) { setError("اكتبي رأيكِ بثلاثة أحرف على الأقل."); return; }
    submit.mutate();
  }
  return (
    <section className="mt-20 border-t border-primary/15 pt-12" aria-labelledby={headingId} data-testid={category === "all" ? "all-feedback" : "category-feedback"}>
      <div className="text-center">
        <MessageCircle className="mx-auto h-7 w-7 text-primary/70" aria-hidden />
       <h3 id={headingId} className="mt-3 font-amiri text-3xl text-primary">{category === "all" ? t("آراء عملائنا — جميع الأقسام") : `${t("آراؤكم —")} ${label}`}</h3>
       <p className="mt-2 text-sm text-muted-foreground">{t(category === "all" ? "تجاربكم وصوركم من جميع الأقسام، الأحدث أولاً." : "شاركي تجربتكِ، وأرفقي صورة إذا أحببتِ.")}</p>
      </div>
      {category === "all" && (
        <label className="mx-auto mt-6 block max-w-md text-sm">
         {t("اختاري القسم الذي تريدين إضافة رأيكِ عنه")}
          <select value={selected} disabled={submit.isPending} onChange={(e) => { setSelected(e.target.value as Category); setSuccess(""); }} className="mt-2 w-full rounded-xl border border-input bg-card p-3" data-testid="feedback-category">
            {categories.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
      )}
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-primary/15 bg-card/80 p-5 sm:p-8">
       {isLoading ? <p role="status">{t("جارٍ التحقق من تسجيل الدخول...")}</p> : !isAuthenticated ? (
          <div className="text-center">
           <p className="text-sm leading-relaxed text-muted-foreground">{t("سجّلي الدخول لكتابة رأيكِ وإرفاق صورة. يمكنكِ قراءة آراء الزبائن دون تسجيل.")}</p>
           <Link href="/login" onClick={() => { sessionStorage.setItem("lm-feedback-category", activeCategory); }} className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground" data-testid="feedback-login">{t("تسجيل الدخول لإضافة فيدباك")}</Link>
          </div>
        ) : (
         <form noValidate onSubmit={onSubmit} className="space-y-4" data-testid="feedback-form">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
             <span>{t("أهلاً")} <bdi>{user?.firstName || t("بكِ")}</bdi></span>
             <button type="button" onClick={logout} disabled={submit.isPending} className="text-muted-foreground underline">{t("تسجيل الخروج")}</button>
            </div>
            <label className="block text-sm">
             {t("رأيكِ في قسم")} {label}
             <textarea dir="auto" required minLength={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} disabled={submit.isPending} rows={4} className="mt-2 w-full resize-y rounded-2xl border border-input bg-background p-4 outline-none focus:ring-2 focus:ring-primary/30" placeholder={t("احكي لنا عن تجربتكِ...")} data-testid="feedback-text" />
            </label>
           <p className="text-xs text-muted-foreground">{text.length} / 2000 {t("حرف")}</p>
            <label className="block text-sm">
             <span className="mb-2 flex items-center gap-2"><ImagePlus className="h-4 w-4" />{t("إرفاق صورة (اختياري)")}</span>
             <input ref={fileInput} type="file" tabIndex={-1} aria-label={t("إرفاق صورة (اختياري)")} accept="image/jpeg,image/png,image/webp" disabled={submit.isPending} className="sr-only" data-testid="feedback-image" onChange={(e) => {
                const image = e.target.files?.[0]; setError(""); setSuccess("");
                if (!image) { setFile(null); return; }
                if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 5 * 1024 * 1024 || image.size === 0) {
                  setError("اختاري صورة JPG أو PNG أو WebP بحجم لا يتجاوز 5 ميغابايت."); removePhoto(); return;
                }
                setFile(image);
              }} />
             <span className="flex flex-wrap items-center gap-3">
               <button type="button" onClick={() => fileInput.current?.click()} disabled={submit.isPending} className="rounded-full bg-secondary px-4 py-2 text-primary focus-visible:outline-2 focus-visible:outline-primary" data-testid="feedback-choose-image">{t("اختيار صورة")}</button>
               <span className="min-w-0 break-all text-muted-foreground"><bdi>{file?.name || t("لم تُختَر صورة")}</bdi></span>
             </span>
            </label>
           <p className="text-xs text-muted-foreground">{t("JPG، PNG أو WebP — حتى 5 ميغابايت. سيظهر اسمكِ ورأيكِ وصورتكِ للجميع؛ لا ترفقي معلومات خاصة.")}</p>
            {preview && <div className="relative w-fit">
             <img src={preview} alt={t("معاينة الصورة المرفقة")} className="max-h-52 rounded-2xl object-contain" />
             <button type="button" onClick={removePhoto} disabled={submit.isPending} aria-label={t("إزالة الصورة المرفقة")} className="absolute end-2 top-2 rounded-full bg-background p-2"><X className="h-4 w-4" /></button>
            </div>}
           <button type="submit" disabled={submit.isPending} className="rounded-full bg-primary px-7 py-3 text-primary-foreground disabled:opacity-60" data-testid="feedback-submit">{t(submit.isPending ? "جارٍ رفع الصورة ونشر الرأي..." : "نشر رأيي")}</button>
          </form>
        )}
       {error && <p role="alert" className="mt-4 text-sm text-destructive">{t(error)}</p>}
       {success && <p role="status" className="mt-4 text-sm text-primary">{t(success)}</p>}
      </div>
      <div className="mx-auto mt-8 max-w-4xl" aria-live="polite">
       {feedback.isPending ? <p className="text-center text-muted-foreground">{t("جارٍ تحميل الآراء...")}</p> : feedback.isError ? (
         <div className="text-center"><p className="text-destructive">{t("تعذّر تحميل الآراء.")}</p><button onClick={() => void feedback.refetch()} className="mt-3 text-primary underline">{t("إعادة المحاولة")}</button></div>
       ) : feedback.data.items.length === 0 ? <p className="text-center text-muted-foreground">{t(category === "all" ? "لا توجد آراء بعد. كوني أول من يشارك تجربته." : "لا توجد آراء في هذا القسم بعد. كوني أول من يشارك تجربته.")}</p> : (
          <div className="grid gap-5 sm:grid-cols-2">{feedback.data.items.map((item) => (
            <article key={item.id} className="min-w-0 rounded-3xl border border-primary/10 bg-card p-5" data-testid={`feedback-${item.id}`}>
              <div className="flex items-start justify-between gap-3">
               <div><h4 className="font-medium"><bdi>{item.authorName}</bdi></h4><time dateTime={item.createdAt} className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString(locale)}</time></div>
               {item.canDelete && <button onClick={() => void deleteFeedback(item.id)} disabled={deleting !== null} aria-label={t("حذف رأيي")} className="rounded-full p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
              </div>
              {category === "all" && <p className="mt-3 w-fit rounded-full bg-secondary px-3 py-1 text-xs text-primary">{categories.find((c) => c.id === item.category)?.label}</p>}
             <p dir="auto" className="mt-4 whitespace-pre-wrap break-words text-sm leading-loose">{item.text}</p>
             {item.imageUrl && <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" aria-label={t("عرض الصورة المرفقة بالحجم الكامل")}><img src={item.imageUrl} alt={`${t("صورة مرفقة برأي")} ${item.authorName}`} loading="lazy" className="mt-4 max-h-80 w-full rounded-2xl object-contain" /></a>}
            </article>
          ))}</div>
        )}
      </div>
    </section>
  );
}