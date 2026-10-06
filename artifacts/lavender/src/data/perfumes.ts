import type { Product } from "./products";

const image = (filename: string) => `${import.meta.env.BASE_URL}images/${filename}`;
type PerfumeRow = [id: string, name: string, englishName: string, volume: number | undefined, price: number, photo: string];

// Owner-confirmed catalog. OPERA awaits a verified photo.
const rows: PerfumeRow[] = [
  ["marshmallow-blush", "MARSHMALLOW BLUSH", "MARSHMALLOW BLUSH", undefined, 5, "0145"],
  ["yum-yum", "YUM YUM", "YUM YUM", undefined, 5, "0150"],
  ["island-bliss", "ISLAND BLISS", "ISLAND BLISS", undefined, 5, "0141"],
  ["mousuf-sapphire", "موصوف أزرق — MOUSUF SAPPHIRE", "MOUSUF SAPPHIRE", 50, 15, "0147"],
  ["marshmallow-mist", "LUENCO MARSHMALLOW — رذاذ للجسم", "LUENCO MARSHMALLOW BODY MIST", 100, 5, "0152"],
  ["tahara-pomegranate", "مسك الطهارة رمان", "MUSK AL TAHARA POMEGRANATE", 20, 15, "0144"],
  ["tahara-cranberry", "مسك الطهارة توت بري", "MUSK AL TAHARA CRANBERRY", 20, 15, "0140"],
  ["inass", "لافيرن جورجينا", "LAVERNE GEORGINA", 100, 45, "0139"],
  ["is", "iS Eau de Parfum", "iS Eau de Parfum", 100, 45, "0137"],
  ["fatima", "فاطمة", "Fatima", 100, 45, "0108"],
  ["hareem", "حريم السلطان", "Hareem Al Sultan", 100, 45, "0119"],
  ["yara", "يارا", "Yara", 100, 45, "0110"],
  ["kids-purple", "عطر الأطفال البنفسجي", "Purple children's perfume", 50, 15, "0115"],
  ["olumapea", "OLUMAPEA", "OLUMAPEA", 90, 40, "0111"],
  ["tanaghom", "تناغم", "Tanaghom", 100, 45, "0117"],
  ["qissa", "قصة — Qissa Delicious", "Qissa Delicious", 100, 45, "0122"],
  ["gisah", "قصة — GISAH One & Only", "GISAH One & Only", 100, 45, "0126"],
  ["pomegranate-musk", "مسك حب الرمان — IBRAQ", "Pomegranate Musk — IBRAQ", 75, 50, "0112"],
  ["powder-musk", "مسك باودر — IBRAQ", "Powder Musk — IBRAQ", 75, 50, "0107"],
  ["hayaati", "حياتي", "Hayaati", 100, 45, "0109"],
  ["sabaya", "صبايا", "Sabaya", 100, 45, "0114"],
  ["bint-hooran", "بنت حوران", "Bint Hooran", 100, 45, "0123"],
  ["rose-paris", "روز باريس", "Rose Paris", 100, 45, "0113"],
  ["cookie-crave", "Lattafa Cookie Crave", "Lattafa Cookie Crave", 75, 55, "0127"],
  ["vanilla-freak", "Lattafa Vanilla Freak", "Lattafa Vanilla Freak", 75, 55, "0130"],
  ["whipped-pleasure", "Lattafa Whipped Pleasure", "Lattafa Whipped Pleasure", 75, 55, "0124"],
  ["berry-on-top", "Lattafa Berry On Top", "Lattafa Berry On Top", 75, 55, "0128"],
  ["coro", "XERJOFF CORO", "XERJOFF CORO", 100, 65, "0116"],
  ["she", "She", "She", 50, 15, "0136"],
  // Retain the existing shop price; the new bottle photo shows 30 ml.
  ["only-you", "عطر Only You", "Only You perfume", 30, 60, "0133"],
];

export const perfumeProducts: Product[] = rows.map(([id, name, englishName, volumeMl, price, photo]) => {
  const newPhoto = image(`perfume-${photo}.jpeg`);
  const primary = id === "powder-musk" ? image("perfume-powder-musk.jpeg") : newPhoto;
  return {
    id: `perfume-${id}`, name: name.toUpperCase(), englishName: englishName.toUpperCase(), category: "perfumes", volumeMl, price,
    currency: "ILS", actualPrice: true, suppliedPhoto: true,
    image: primary, images: primary === newPhoto ? [primary] : [primary, newPhoto],
    short: name.toUpperCase(), description: name.toUpperCase(), notes: [],
  };
});
