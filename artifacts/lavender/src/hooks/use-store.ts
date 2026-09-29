import { useCallback, useEffect, useState } from "react";
import { products } from "@/data/products";

const validIds = new Set(products.map((p) => p.id));
const cleanFavs = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && validIds.has(id)))] : [];
const cleanBag = (value: unknown): Record<string, number> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).filter(([id, n]) => validIds.has(id) && typeof n === "number" && Number.isFinite(n) && n >= 1).map(([id, n]) => [id, Math.min(20, Math.floor(n as number))]))
    : {};

function usePersisted<T>(key: string, initial: T, sanitize: (value: unknown) => T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? sanitize(JSON.parse(raw)) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
  }, [key, v]);
  return [v, setV] as const;
}

export function useStore() {
  const [favs, setFavs] = usePersisted<string[]>("lm-favs", [], cleanFavs);
  const [bag, setBag] = usePersisted<Record<string, number>>("lm-bag", {}, cleanBag);

  const toggleFav = useCallback((id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])), [setFavs]);
  const add = useCallback((id: string, q = 1) => setBag((b) => ({ ...b, [id]: Math.min(20, (b[id] ?? 0) + q) })), [setBag]);
  const setQty = useCallback((id: string, q: number) => setBag((b) => {
    const n = { ...b };
    if (q <= 0) delete n[id]; else n[id] = Math.min(20, q);
    return n;
  }), [setBag]);
  const clear = useCallback(() => setBag({}), [setBag]);

  return { favs, bag, toggleFav, add, setQty, clear };
}
