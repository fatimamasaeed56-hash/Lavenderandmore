export type Category = "cosmetics" | "flowers" | "candles" | "cups" | "gifts";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  short: string;
  description: string;
  notes: string[];
}

const img = (n: string) => `${import.meta.env.BASE_URL}images/${n}.jpg`;

export const categories: { id: Category | "all"; label: string; hint: string }[] = [
  { id: "all", label: "الكل", hint: "كل ما في الرفوف" },
  { id: "cosmetics", label: "مستحضرات التجميل", hint: "العناية والجمال" },
  { id: "flowers", label: "الورد", hint: "باقات مربوطة باليد" },
  { id: "candles", label: "الشموع", hint: "ضوء دافئ ورائحة هادئة" },
  { id: "cups", label: "الأكواب", hint: "لقهوة الصباح" },
  { id: "gifts", label: "صناديق الهدايا", hint: "مجموعات جاهزة للإهداء" },
];

export const products: Product[] = [
  { id: "serum-lilac", name: "سيروم الوجه الليلكي", category: "cosmetics", price: 185, image: img("serum"), short: "زجاجة بقطّارة لروتين المساء", description: "سيروم خفيف في زجاجة ليلكية أنيقة، يُضاف إلى روتين العناية المسائي. منتج تجريبي للعرض فقط.", notes: ["٣٠ مل", "زجاجة بقطّارة", "للاستخدام المسائي"] },
  { id: "lipstick-plum", name: "أحمر شفاه البرقوق", category: "cosmetics", price: 95, image: img("lipstick"), short: "لون برقوقي بلمسة ساتان", description: "أحمر شفاه بدرجة برقوقية دافئة ولمسة نهائية ساتان، مع علبة كريم صغيرة مرافقة. منتج تجريبي للعرض فقط.", notes: ["لمسة ساتان", "درجة البرقوق", "حجم الحقيبة"] },
  { id: "palette-mauve", name: "باليت ظلال الموف", category: "cosmetics", price: 160, image: img("palette"), short: "درجات موف وبرقوق ناعمة", description: "باليت ظلال عيون بدرجات الموف والوردي الترابي والبرقوق، مع فرشاة صغيرة. منتج تجريبي للعرض فقط.", notes: ["تسع درجات", "فرشاة مرفقة", "مرآة داخلية"] },
  { id: "cream-jar", name: "كريم اليدين بالخزامى", category: "cosmetics", price: 70, image: img("lipstick"), short: "علبة صغيرة للحقيبة", description: "كريم يدين في علبة صغيرة تناسب الحقيبة، برائحة خزامى خفيفة. منتج تجريبي للعرض فقط.", notes: ["٥٠ مل", "رائحة خزامى", "حجم السفر"] },
  { id: "bouquet-lavender", name: "باقة الخزامى والورد", category: "flowers", price: 220, image: img("bouquet"), short: "مربوطة بشريط وردي", description: "باقة من الخزامى والورد الوردي الفاتح، ملفوفة بورق ناعم ومربوطة بشريط. منتج تجريبي للعرض فقط.", notes: ["تنسيق يدوي", "ورق تغليف وردي", "شريط ساتان"] },
  { id: "candle-lilac", name: "شمعة الليلك", category: "candles", price: 120, image: img("candle"), short: "في برطمان زجاجي", description: "شمعة معطّرة في برطمان زجاجي بلون الليلك، لأمسيات هادئة. منتج تجريبي للعرض فقط.", notes: ["برطمان زجاجي", "رائحة زهرية", "فتيل قطني"] },
  { id: "cup-heart", name: "كوب القلب الصغير", category: "cups", price: 65, image: img("cup"), short: "سيراميك ليلكي بقلب مرسوم", description: "كوب سيراميك بلون ليلكي هادئ وقلب صغير مرسوم يدوياً. منتج تجريبي للعرض فقط.", notes: ["سيراميك", "قلب مرسوم", "٣٠٠ مل تقريباً"] },
  { id: "box-dream", name: "صندوق «كان حلماً»", category: "gifts", price: 340, image: img("giftbox"), short: "كريم، شمعة، وشريط", description: "صندوق هدية يجمع كريماً صغيراً وشمعة خزامى في ورق حريري وشريط. محتوى الصندوق تجريبي للعرض فقط.", notes: ["ورق حريري", "بطاقة إهداء", "شريط ليلكي"] },
];

export const formatPrice = (n: number) => `${n.toLocaleString("ar-EG")}`;
