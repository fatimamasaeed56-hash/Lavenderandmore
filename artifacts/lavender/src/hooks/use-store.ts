import { useCallback, useEffect, useState } from "react";

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
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
  const [favs, setFavs] = usePersisted<string[]>("lm-favs", []);
  const [bag, setBag] = usePersisted<Record<string, number>>("lm-bag", {});

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
