import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/data/products";

export function ProductGallery({ product, language }: { product: Product; language: "ar" | "en" }) {
  const photos = Array.from(new Set([product.image, ...(product.images ?? [])]));
  const [selected, setSelected] = useState(photos.length > 1 ? 1 : 0);
  const [ref, api] = useEmblaCarousel({
    startIndex: photos.length > 1 ? 1 : 0,
    loop: photos.length > 1,
    direction: "ltr",
  }, []);
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => { api.off("select", update); api.off("reInit", update); };
  }, [api]);
  const label = language === "ar" ? "صور العطر — اسحبي للتبديل" : "Product photos — swipe to browse";
  return (
    <section aria-label={label} className="min-w-0 bg-secondary/20" dir="ltr">
      <div ref={ref} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {photos.map((src, index) => (
            <div key={src} className="min-w-0 flex-[0_0_100%]">
              <img src={src} alt={`${product.name} — ${index + 1}`} className="h-64 w-full object-contain md:h-[440px]" />
            </div>
          ))}
        </div>
      </div>
      {photos.length > 1 && <div className="flex flex-wrap justify-center gap-3 p-3">
        {photos.map((src, index) => <button key={src} type="button"
          aria-label={`${language === "ar" ? "الصورة" : "Photo"} ${index + 1}`}
          aria-pressed={selected === index}
          onClick={() => { api?.scrollTo(index); setSelected(index); }}
          className={`overflow-hidden rounded-lg border-2 ${selected === index ? "border-primary" : "border-transparent"}`}>
          <img src={src} alt="" className="h-14 w-12 object-contain" />
        </button>)}
        <p className="w-full text-center text-xs text-muted-foreground">{label}</p>
      </div>}
    </section>
  );
}
