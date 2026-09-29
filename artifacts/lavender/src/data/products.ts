export type Category = "cups" | "perfumes" | "beauty" | "cosmetics" | "bodycare" | "flowers";

export interface Product {
  id: string;
  name: string;
  category: Exclude<Category, "beauty">;
  price: number;
  actualPrice?: boolean;
  suppliedPhoto?: boolean;
  perItem?: boolean;
  currency?: "ILS";
  image: string;
  short: string;
  description: string;
  notes: string[];
}

const img = (n: string) => `${import.meta.env.BASE_URL}images/${n}.jpg`;

export const categories: { id: Category | "all"; label: string; hint: string; parent?: Category }[] = [
  { id: "all", label: "الكل", hint: "كل ما في الرفوف" },
  { id: "cups", label: "أكواب", hint: "لقهوة الصباح" },
  { id: "perfumes", label: "عطور", hint: "تفاصيل عطرية" },
  { id: "beauty", label: "منتجات تجميل", hint: "كوزمتيكس وعناية بالجسم" },
  { id: "cosmetics", label: "كوزمتيكس", hint: "لمسات الجمال", parent: "beauty" },
  { id: "bodycare", label: "عناية بالجسم", hint: "لروتين العناية", parent: "beauty" },
  { id: "flowers", label: "الورد", hint: "باقات مربوطة باليد" },
];

export const mainCategories = categories.filter((c) => c.id !== "all" && !c.parent);
export const beautyCategories = categories.filter((c) => c.parent === "beauty");
export const matchesCategory = (product: Product, category: Category | "all") =>
  category === "all" || product.category === category ||
  categories.some((c) => c.id === product.category && c.parent === category);

export const products: Product[] = [
  { id: "liquid-lipstick", name: "حمرة سائلة", category: "cosmetics", price: 3, actualPrice: true, suppliedPhoto: true, perItem: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/liquid-lipstick.jpeg`, short: "حمرة سائلة بألوان متنوعة", description: "حمرة سائلة كما تظهر في الصورة. السعر للقطعة الواحدة وليس للمجموعة كاملة.", notes: ["للقطعة الواحدة"] },
  { id: "lipstick-stick", name: "حمرة ستيك", category: "cosmetics", price: 5, actualPrice: true, suppliedPhoto: true, perItem: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/lipstick-stick.jpeg`, short: "حمرة ستيك بألوان متنوعة", description: "حمرة ستيك كما تظهر في الصورة. السعر للقطعة الواحدة وليس لجميع الأقلام الظاهرة.", notes: ["للقطعة الواحدة"] },
  { id: "blush", name: "بلاشر", category: "cosmetics", price: 5, actualPrice: true, suppliedPhoto: true, perItem: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/blush.jpeg`, short: "بلاشر في علبة صغيرة", description: "بلاشر كما يظهر في الصورة. السعر للقطعة الواحدة وليس لصندوق العرض كاملًا.", notes: ["للقطعة الواحدة"] },
  { id: "perfume-qissa", name: "عطور قصة", category: "perfumes", price: 70, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-qissa.jpeg`, short: "تشكيلة عطور قصة بالصورة المزوّدة", description: "صورة مزوّدة لتشكيلة عطور قصة. السعر للقطعة الواحدة، وليس لكل المنتجات الظاهرة في الصورة.", notes: ["للقطعة الواحدة", "ليست مجموعة بسعر واحد"] },
  { id: "perfume-only-you", name: "عطر Only You", category: "perfumes", price: 60, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-only-you.jpeg`, short: "عطر Only You بالصورة المزوّدة", description: "عطر Only You كما يظهر في الصورة المزوّدة. السعر للقطعة الواحدة، وليس لمجموعة منتجات.", notes: ["للقطعة الواحدة"] },
  { id: "perfume-selection", name: "تشكيلة عطور", category: "perfumes", price: 65, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-selection.jpeg`, short: "تشكيلة تضم عبوة عطر بنفسجية", description: "صورة مزوّدة لعدة عطور، بينها عبوة بنفسجية. السعر لقطعة واحدة فقط، وليس للتشكيلة كاملة. إضافة واحدة للحقيبة تعني قطعة واحدة.", notes: ["للقطعة الواحدة", "ليست مجموعة بسعر واحد"] },
  { id: "perfume-marshmallow", name: "مارشميلو — عطر ورذاذ للجسم", category: "perfumes", price: 55, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-marshmallow.jpeg`, short: "عطر ورذاذ للجسم في الصورة المزوّدة", description: "صورة مزوّدة لعطر ورذاذ للجسم مارشميلو. السعر لقطعة واحدة فقط، وليس للعطر والرذاذ معاً.", notes: ["للقطعة الواحدة", "ليست مجموعة بسعر واحد"] },
  { id: "perfume-white-musk", name: "مسك أبيض — IBRAQ", category: "perfumes", price: 50, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-white-musk.jpeg`, short: "مسك أبيض بالصورة المزوّدة", description: "مسك أبيض IBRAQ كما يظهر في الصورة المزوّدة. السعر للقطعة الواحدة.", notes: ["للقطعة الواحدة"] },
  { id: "perfume-powder-musk", name: "مسك باودر — IBRAQ", category: "perfumes", price: 50, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-powder-musk.jpeg`, short: "مسك باودر بالصورة المزوّدة", description: "مسك باودر IBRAQ كما يظهر في الصورة المزوّدة. السعر للقطعة الواحدة.", notes: ["للقطعة الواحدة"] },
  { id: "serum-lilac", name: "سيروم الوجه الليلكي", category: "cosmetics", price: 185, image: img("serum"), short: "زجاجة بقطّارة لروتين المساء", description: "سيروم خفيف في زجاجة ليلكية أنيقة، يُضاف إلى روتين العناية المسائي. منتج تجريبي للعرض فقط.", notes: ["٣٠ مل", "زجاجة بقطّارة", "للاستخدام المسائي"] },
  { id: "lipstick-plum", name: "أحمر شفاه البرقوق", category: "cosmetics", price: 95, image: img("lipstick"), short: "لون برقوقي بلمسة ساتان", description: "أحمر شفاه بدرجة برقوقية دافئة ولمسة نهائية ساتان، مع علبة كريم صغيرة مرافقة. منتج تجريبي للعرض فقط.", notes: ["لمسة ساتان", "درجة البرقوق", "حجم الحقيبة"] },
  { id: "palette-mauve", name: "باليت ظلال الموف", category: "cosmetics", price: 160, image: img("palette"), short: "درجات موف وبرقوق ناعمة", description: "باليت ظلال عيون بدرجات الموف والوردي الترابي والبرقوق، مع فرشاة صغيرة. منتج تجريبي للعرض فقط.", notes: ["تسع درجات", "فرشاة مرفقة", "مرآة داخلية"] },
  { id: "cream-jar", name: "كريم اليدين بالخزامى", category: "bodycare", price: 70, image: img("lipstick"), short: "علبة صغيرة للحقيبة", description: "كريم يدين في علبة صغيرة تناسب الحقيبة، برائحة خزامى خفيفة. منتج تجريبي للعرض فقط.", notes: ["٥٠ مل", "رائحة خزامى", "حجم السفر"] },
  { id: "bouquet-lavender", name: "باقة الخزامى والورد", category: "flowers", price: 220, image: img("bouquet"), short: "مربوطة بشريط وردي", description: "باقة من الخزامى والورد الوردي الفاتح، ملفوفة بورق ناعم ومربوطة بشريط. منتج تجريبي للعرض فقط.", notes: ["تنسيق يدوي", "ورق تغليف وردي", "شريط ساتان"] },
  { id: "cup-cherry", name: "كوب كرز", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-cherry.jpeg`, short: "رسومات كرز حمراء وأوراق خضراء", description: "كوب أبيض تزيّنه رسومات كرز حمراء مع أوراق خضراء.", notes: ["رسومات كرز", "لون أبيض"] },
  { id: "cup-pink-heart", name: "كوب قلب زهر", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-pink-heart.jpeg`, short: "قلوب زهرية على خلفية بيضاء", description: "كوب أبيض تزيّنه قلوب بلون زهري فاتح.", notes: ["قلوب زهرية", "لون أبيض"] },
  { id: "cup-red-heart", name: "كوب قلب أحمر", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-red-heart.jpeg`, short: "قلوب حمراء على خلفية بيضاء", description: "كوب أبيض تزيّنه قلوب حمراء موزّعة على سطحه.", notes: ["قلوب حمراء", "لون أبيض"] },
  { id: "cup-hearts-pink-band", name: "كوب قلوب وشريط زهري", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-hearts-pink-band.jpeg`, short: "قلوب حمراء وشريط زهري حول الكوب", description: "كوب أبيض بتصميم قلوب حمراء وشريط زهري مرسوم حول الجزء السفلي.", notes: ["قلوب حمراء", "شريط زهري مرسوم"] },
];

export const formatPrice = (n: number) => `${n.toLocaleString("ar-EG")}`;
export const formatProductPrice = (p: Product, quantity = 1) =>
  `${formatPrice(p.price * quantity)}${p.currency === "ILS" ? " شيكل" : ""}${p.actualPrice ? "" : " — سعر توضيحي"}`;
