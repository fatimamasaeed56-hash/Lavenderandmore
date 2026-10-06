import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/context";

export interface DiscoverItem {
  id: string;
  label: string;
  act: () => void;
  nested?: boolean;
}

export function DiscoverMenu({ items }: { items: DiscoverItem[] }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pinned = useRef(false);
  const close = () => { pinned.current = false; setOpen(false); };

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  return (
    <nav ref={root} className="relative shrink-0" aria-label={t("التنقل الرئيسي")}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" && !pinned.current && !root.current?.contains(document.activeElement)) close();
      }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") { close(); trigger.current?.focus(); }
        if (event.key === "ArrowDown" && event.target === trigger.current) {
          event.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>("[data-discover-item]")?.focus());
        }
      }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="discover-sections"
        data-testid="button-discover"
        onClick={() => { pinned.current = !pinned.current; setOpen(pinned.current); }}
        className="flex items-center gap-1 rounded-full px-2 py-2 text-sm font-medium text-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary sm:px-4 sm:text-base">
        {t("رفوفنا")}
        <ChevronDown aria-hidden className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute start-0 top-full z-50 w-52 pt-2 sm:start-1/2 sm:-translate-x-1/2 rtl:sm:translate-x-1/2">
          <div id="discover-sections" className="max-h-[70dvh] overflow-y-auto rounded-2xl border border-primary/15 bg-background p-2 shadow-xl">
            {items.map((item) => (
              <button key={item.id} type="button" data-discover-item data-testid={`discover-${item.id}`}
                onClick={() => { close(); item.act(); }}
                className={`block w-full rounded-xl px-3 py-2.5 text-start text-sm hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-2 focus-visible:outline-primary ${item.nested ? "ps-7 text-primary/75" : "font-medium text-foreground"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
