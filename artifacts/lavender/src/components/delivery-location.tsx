import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type DeliveryLocation = { address: string; mapUrl?: string };

export function DeliveryLocationPicker({ value, onChange }: { value: DeliveryLocation; onChange: (value: DeliveryLocation) => void }) {
  const [open, setOpen] = useState(true);
  const [address, setAddress] = useState(value.address);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancel = () => {
    request.current += 1;
    clearTimeout(timer.current);
    setBusy(false);
  };
  useEffect(() => () => { request.current += 1; clearTimeout(timer.current); }, []);
  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("متصفحك لا يدعم تحديد الموقع. اكتبي العنوان يدويًا.");
      return;
    }
    setBusy(true);
    const current = ++request.current;
    timer.current = setTimeout(() => {
      if (request.current !== current) return;
      cancel();
      setError("استغرق تحديد الموقع وقتًا طويلًا. يمكنكِ المحاولة مجددًا أو كتابة العنوان يدويًا.");
    }, 15000);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (request.current !== current) return;
      cancel();
      onChange({ address: address.trim(), mapUrl: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}` });
      setOpen(false);
    }, (failure) => {
      if (request.current !== current) return;
      cancel();
      setError(failure.code === 1 ? "لم يُسمح بالوصول للموقع. يمكنكِ السماح من إعدادات المتصفح أو كتابة العنوان يدويًا." : "تعذّر تحديد الموقع. حاولي مجددًا أو اكتبي العنوان يدويًا.");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }
  return <>
    <button type="button" onClick={() => setOpen(true)} className="mx-auto mt-5 flex items-center gap-2 rounded-full border border-primary/25 px-5 py-2 text-sm text-primary lg:mx-0">
      <MapPin className="h-4 w-4" />{value.mapUrl || value.address ? "تعديل موقع التوصيل" : "حدّدي موقع التوصيل"}
    </button>
    <Dialog open={open} onOpenChange={(next) => { if (!next) cancel(); setOpen(next); }}>
      <DialogContent dir="rtl" className="max-w-sm rounded-2xl">
        <DialogTitle className="text-right font-amiri text-2xl text-primary">أين نوصّل طلبكِ؟</DialogTitle>
        <DialogDescription className="text-right leading-relaxed">حدّدي موقعكِ بإذنكِ أو اكتبي عنوانكِ. لن يُرسل الموقع للمحل إلا ضمن رسالة الطلب التي ترسلينها عبر واتساب.</DialogDescription>
        <button disabled={busy} onClick={locate} className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground disabled:opacity-60"><MapPin className="h-5 w-5" />{busy ? "جارٍ تحديد الموقع…" : "استخدام موقعي الحالي"}</button>
        {value.mapUrl && <div className="flex items-center justify-between text-sm">
          <a href={value.mapUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">عرض الموقع المحدد</a>
          <button onClick={() => onChange({ address: value.address })} className="text-destructive">إزالة الموقع</button>
        </div>}
        <form onSubmit={(e) => { e.preventDefault(); cancel(); onChange({ ...value, address: address.trim() }); setOpen(false); }} className="space-y-3">
          <label className="block text-sm">المدينة والعنوان بالتفصيل
            <textarea required value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} autoComplete="street-address" className="mt-2 w-full rounded-xl border border-input bg-background p-3" rows={2} />
          </label>
          <button className="w-full rounded-full border border-primary/30 px-4 py-2 text-primary">حفظ العنوان</button>
        </form>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button onClick={() => { cancel(); setOpen(false); }} className="text-sm text-muted-foreground underline">تصفّح المتجر الآن وتحديد الموقع لاحقًا</button>
      </DialogContent>
    </Dialog>
  </>;
}