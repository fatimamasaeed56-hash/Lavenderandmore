import { useEffect, useState, type FormEvent } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { type Product } from "@/data/products";
import { bagColors } from "@/hooks/use-store";
import type { DeliveryLocation } from "@/components/delivery-location";

export function WhatsAppOrder({ items, location }: { items: { id: string; p: Product; n: number }[]; location: DeliveryLocation }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(location.address);
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const signature = JSON.stringify(items.map(({ id, n, p }) => [id, n, p.price]));
  useEffect(() => { setLink(""); }, [signature, name, phone, address, notes, location.mapUrl]);
  useEffect(() => { setAddress(location.address); }, [location.address]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const normalizedPhone = phone.trim()
      .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
    if (!name.trim() || !address.trim() || !/^\+?[\d\s()-]{7,20}$/.test(normalizedPhone) || normalizedPhone.replace(/\D/g, "").length < 7) {
      setError("أدخلي الاسم وعنوان التوصيل ورقم هاتف صحيح.");
      return;
    }
    if (!items.length) { setError("أضيفي منتجاً إلى الحقيبة أولاً."); return; }
    const total = items.reduce((sum, { p, n }) => sum + p.price * n, 0);
    const message = [
      "مرحباً Lavender & More، أرغب بطلب المنتجات التالية:",
      ...items.map(({ id, p, n }, i) => `${i + 1}. ${p.name}\nالكمية: ${n} — سعر الوحدة: ${p.price} شيكل — المجموع: ${p.price * n} شيكل${p.category === "flowers" ? `\nالألوان: ${bagColors(id) || "كما في الصورة"}` : ""}`),
      `مجموع المنتجات: ${total} شيكل (لا يشمل التوصيل)`,
      "طريقة الدفع: عند الاستلام",
      `الاسم: ${name.trim()}`,
      `الهاتف: ${normalizedPhone}`,
      `عنوان التوصيل: ${address.trim()}`,
      ...(location.mapUrl ? [`موقع التوصيل على الخريطة: ${location.mapUrl}`] : []),
      ...(notes.trim() ? [`ملاحظات: ${notes.trim()}`] : []),
      "يرجى تأكيد توفر المنتجات ورسوم التوصيل والمبلغ النهائي وموعد التوصيل.",
    ].join("\n\n");
    const url = `https://wa.me/972593860029?text=${encodeURIComponent(message)}`;
    setLink(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }
  const field = "mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-primary/30";

  return (
    <div className="mt-6 border-t border-primary/15 pt-5">
      <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="whatsapp-order-form" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground" data-testid="button-checkout-whatsapp">
        <FaWhatsapp className="h-5 w-5" aria-hidden="true" />طلب عبر واتساب — الدفع عند الاستلام
      </button>
      {expanded && <form id="whatsapp-order-form" onSubmit={submit} className="mt-5 space-y-4" data-testid="form-whatsapp-order">
        <h3 className="font-amiri text-xl text-primary">بيانات التوصيل</h3>
        <label className="block text-sm">الاسم
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" className={field} data-testid="order-name" />
        </label>
        <label className="block text-sm">رقم الهاتف
          <input type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} autoComplete="tel" className={field} data-testid="order-phone" />
        </label>
        <label className="block text-sm">المدينة والعنوان بالتفصيل
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required maxLength={300} rows={2} autoComplete="street-address" className={field} data-testid="order-address" />
        </label>
        {location.mapUrl && <p className="text-sm text-primary">تم تحديد موقعكِ وسيُرفق برسالة الطلب. <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="underline">عرض على الخريطة</a></p>}
        <label className="block text-sm">ملاحظات (اختياري)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={2} className={field} data-testid="order-notes" />
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground">ستُفتح رسالة جاهزة في واتساب تتضمن بياناتكِ ومنتجاتكِ. اضغطي إرسال هناك لإرسال الطلب. يُؤكّد الطلب والتوفر ورسوم التوصيل عبر المحادثة، والدفع عند الاستلام.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground" data-testid="button-send-whatsapp-order"><FaWhatsapp className="h-5 w-5" aria-hidden="true" />متابعة إلى واتساب</button>
        {link && <div role="status" className="rounded-xl bg-secondary p-3 text-sm leading-relaxed">
          لم يُؤكَّد الطلب بعد؛ أرسلي الرسالة في واتساب وانتظري ردّنا. بقيت المنتجات في حقيبتكِ.
          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 block text-primary underline">إذا لم يفتح واتساب، اضغطي هنا</a>
        </div>}
      </form>}
    </div>
  );
}