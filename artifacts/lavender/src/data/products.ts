import { translate, type Language } from "@/i18n/messages";
import { perfumeProducts } from "./perfumes";

export type Category = "cups" | "perfumes" | "beauty" | "cosmetics" | "bodycare" | "flowers" | "printing";

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
  images?: string[];
  volumeMl?: number;
  englishName?: string;
  variantGroup?: string;
  hiddenFromCatalog?: boolean;
  short: string;
  description: string;
  notes: string[];
}

// Sizes verified from packaging photos or confirmed by the shop owner.
const confirmedVolumesMl: Record<string, number> = {
  "perfume-only-you": 50,
  "perfume-selection": 100,
  "perfume-qissa": 50,
  "perfume-marshmallow": 50,
  "perfume-white-musk": 50,
  "perfume-powder-musk": 50,
};
export const productVolumeLabel = (product: Product, language: Language = "ar") =>
  (product.volumeMl ?? confirmedVolumesMl[product.id]) ? `${translate(language, "حجم العبوة")}: ${product.volumeMl ?? confirmedVolumesMl[product.id]} ${translate(language, "مل")}` : "";

export const categories: { id: Category | "all"; label: string; hint: string; parent?: Category }[] = [
  { id: "all", label: "الكل", hint: "كل ما في الرفوف" },
  { id: "cups", label: "أكواب", hint: "لقهوة الصباح" },
  { id: "perfumes", label: "عطور", hint: "تفاصيل عطرية" },
  { id: "beauty", label: "منتجات تجميل", hint: "كوزمتيكس وعناية بالجسم" },
  { id: "cosmetics", label: "كوزمتيكس", hint: "لمسات الجمال", parent: "beauty" },
  { id: "bodycare", label: "عناية بالجسم", hint: "لروتين العناية", parent: "beauty" },
  { id: "flowers", label: "الورد", hint: "باقات مربوطة باليد" },
  { id: "printing", label: "الطباعة", hint: "coming soon" },
];

export const mainCategories = categories.filter((c) => c.id !== "all" && !c.parent);
export const beautyCategories = categories.filter((c) => c.parent === "beauty");
export const matchesCategory = (product: Product, category: Category | "all") =>
  category === "all" || product.category === category ||
  categories.some((c) => c.id === product.category && c.parent === category);

const originalProducts: Product[] = [
  { id: "rose-water", name: "ماء الورد — LUENCO", category: "cosmetics", price: 10, volumeMl: 300, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/rose-water.jpeg`, short: "ماء الورد بعبوة ٣٠٠ مل", description: "ماء الورد LUENCO بالأنواع الظاهرة في الصورة.", notes: [] },
  { id: "contour-palette", name: "ROMANTIC COLOR — MAKEUP PLATE", category: "cosmetics", price: 5, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/contour-palette.jpeg`, short: "باليت كونتور بدرجات متعددة", description: "باليت كونتور ROMANTIC COLOR — MAKEUP PLATE، رقم RC5124.", notes: [] },
  { id: "cup-small-red-hearts", name: "كوب قلوب حمراء صغيرة", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-small-red-hearts.jpeg`, short: "كوب أبيض بقلوب حمراء صغيرة مع صحن مطابق", description: "كوب أبيض مزين بقلوب حمراء صغيرة، مع صحن بنفس التصميم.", notes: [] },
  { id: "cup-blue-hearts-bows", name: "كوب قلوب زرقاء وفيونكات", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-blue-hearts-bows.jpeg`, short: "قلوب زرقاء وفيونكات زهرية مع صحن مطابق", description: "كوب أبيض مزين بقلوب زرقاء وفيونكات زهرية، مع صحن بنفس التصميم.", notes: [] },
  { id: "cup-blue-clouds", name: "كوب غيوم أزرق", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-blue-clouds.jpeg`, short: "كوب أزرق بغيوم بيضاء مع صحن مطابق", description: "كوب أزرق مزين بغيوم بيضاء، مع صحن بنفس التصميم.", notes: [] },
  { id: "bouquet-turquoise", name: "باقة ورد بتغليف تركواز", category: "flowers", price: 80, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/bouquet-turquoise.jpeg`, short: "ورد أبيض وزهري بتغليف تركواز وشريط ناعم", description: "باقة الورد الظاهرة في الصورة بتغليف تركواز. السعر للباقة الواحدة. لاختيار ألوان أخرى، اكتبي الألوان المطلوبة في المربع أدناه.", notes: ["للباقة الواحدة", "إمكانية طلب ألوان أخرى"] },
  { id: "baby-powder-lotion", name: "لوشن بيبي باودر", category: "bodycare", price: 20, actualPrice: true, suppliedPhoto: true, perItem: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/baby-powder-lotion.jpeg`, short: "لوشن للجسم بعبوة وردية ومضخة", description: "لوشن بيبي باودر للجسم كما يظهر في الصورة. السعر لعبوة واحدة وليس للعبوتين.", notes: ["للعبوة الواحدة"] },
  { id: "body-soap", name: "صابون الجسم", category: "bodycare", price: 25, actualPrice: true, suppliedPhoto: true, perItem: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/body-soap.jpeg`, short: "صابون في علبة بغطاء وردي", description: "صابون الجسم كما يظهر في الصورة. السعر لعلبة واحدة وليس لجميع العلب الظاهرة.", notes: ["للعلبة الواحدة"] },
  { id: "bodycare-bag", name: "بكج العناية بالجسم — الأحمر", englishName: "Body care package — Red", category: "bodycare", variantGroup: "bodycare-packages", price: 25, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/bodycare-package-red.jpeg`, short: "بكج العناية بالجسم", description: "بكج العناية بالجسم — الأحمر", notes: [] },
  { id: "bodycare-bag-pink", name: "بكج العناية بالجسم — الزهري", englishName: "Body care package — Pink", category: "bodycare", variantGroup: "bodycare-packages", hiddenFromCatalog: true, price: 25, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/bodycare-package-pink.jpeg`, short: "بكج العناية بالجسم", description: "بكج العناية بالجسم — الزهري", notes: [] },
  { id: "bodycare-bag-purple", name: "بكج العناية بالجسم — البنفسجي", englishName: "Body care package — Purple", category: "bodycare", variantGroup: "bodycare-packages", hiddenFromCatalog: true, price: 25, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/bodycare-package-purple.jpeg`, short: "بكج العناية بالجسم", description: "بكج العناية بالجسم — البنفسجي", notes: [] },
  { id: "bodycare-bag-yellow", name: "بكج العناية بالجسم — الأصفر", englishName: "Body care package — Yellow", category: "bodycare", variantGroup: "bodycare-packages", hiddenFromCatalog: true, price: 25, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/bodycare-package-yellow.jpeg`, short: "بكج العناية بالجسم", description: "بكج العناية بالجسم — الأصفر", notes: [] },
  { id: "candy-lotion", name: "لوشن الجسم كاندي وسويت وغامي", category: "bodycare", price: 20, actualPrice: true, suppliedPhoto: true, perItem: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/candy-lotion.jpeg`, short: "لوشن للجسم بعبوات بيضاء وأغطية ذهبية", description: "لوشن الجسم بتشكيلة كاندي وسويت وغامي الظاهرة في الصورة. السعر لعبوة واحدة وليس للمجموعة كاملة.", notes: ["للعبوة الواحدة"] },
  { id: "liquid-lipstick", name: "GOLDEN ROSE — LONGSTAY LIQUID MATTE LIPSTICK", category: "cosmetics", price: 5, actualPrice: true, suppliedPhoto: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/liquid-lipstick.jpeg`, short: "حمرة سائلة مطفية بألوان متنوعة", description: "GOLDEN ROSE — LONGSTAY LIQUID MATTE LIPSTICK، حمرة سائلة مطفية.", notes: [] },
  { id: "perfume-qissa", name: "عطور قصة", category: "perfumes", price: 70, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-qissa.jpeg`, short: "تشكيلة عطور قصة بالصورة المزوّدة", description: "صورة مزوّدة لتشكيلة عطور قصة. السعر للقطعة الواحدة، وليس لكل المنتجات الظاهرة في الصورة.", notes: ["للقطعة الواحدة", "ليست مجموعة بسعر واحد"] },
  { id: "perfume-only-you", name: "عطر Only You", category: "perfumes", price: 60, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-only-you.jpeg`, short: "عطر Only You بالصورة المزوّدة", description: "عطر Only You كما يظهر في الصورة المزوّدة. السعر للقطعة الواحدة، وليس لمجموعة منتجات.", notes: ["للقطعة الواحدة"] },
  { id: "perfume-selection", name: "تشكيلة عطور", category: "perfumes", price: 65, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-selection.jpeg`, short: "تشكيلة تضم عبوة عطر بنفسجية", description: "صورة مزوّدة لعدة عطور، بينها عبوة بنفسجية. السعر لقطعة واحدة فقط، وليس للتشكيلة كاملة. إضافة واحدة للحقيبة تعني قطعة واحدة.", notes: ["للقطعة الواحدة", "ليست مجموعة بسعر واحد"] },
  { id: "perfume-marshmallow", name: "مارشميلو — عطر ورذاذ للجسم", category: "perfumes", price: 55, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-marshmallow.jpeg`, short: "عطر ورذاذ للجسم في الصورة المزوّدة", description: "صورة مزوّدة لعطر ورذاذ للجسم مارشميلو. السعر لقطعة واحدة فقط، وليس للعطر والرذاذ معاً.", notes: ["للقطعة الواحدة", "ليست مجموعة بسعر واحد"] },
  { id: "perfume-white-musk", name: "مسك أبيض — IBRAQ", category: "perfumes", price: 50, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-white-musk.jpeg`, short: "مسك أبيض بالصورة المزوّدة", description: "مسك أبيض IBRAQ كما يظهر في الصورة المزوّدة. السعر للقطعة الواحدة.", notes: ["للقطعة الواحدة"] },
  { id: "perfume-powder-musk", name: "مسك باودر — IBRAQ", category: "perfumes", price: 50, currency: "ILS", actualPrice: true, suppliedPhoto: true, perItem: true, image: `${import.meta.env.BASE_URL}images/perfume-powder-musk.jpeg`, short: "مسك باودر بالصورة المزوّدة", description: "مسك باودر IBRAQ كما يظهر في الصورة المزوّدة. السعر للقطعة الواحدة.", notes: ["للقطعة الواحدة"] },
  { id: "cup-bows-hearts", name: "كوب قلوب وفيونكات", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-bows-hearts.jpeg`, short: "قلوب حمراء وفيونكات على خلفية بيضاء", description: "كوب أبيض تزيّنه قلوب حمراء وفيونكات بنية. السعر للكوب الواحد.", notes: ["قلوب حمراء", "فيونكات بنية"] },
  { id: "cup-pink-butterflies", name: "كوب فراشات زهرية", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-pink-butterflies.jpeg`, short: "فراشات وقلوب صغيرة باللون الزهري", description: "كوب أبيض بتصميم فراشات وقلوب زهرية صغيرة. السعر للكوب الواحد.", notes: ["فراشات زهرية", "لون أبيض"] },
  { id: "cup-pink-clouds", name: "كوب غيوم زهري", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-pink-clouds.jpeg`, short: "غيوم بيضاء على كوب زهري", description: "كوب زهري تزيّنه غيوم بيضاء. السعر للكوب الواحد.", notes: ["غيوم بيضاء", "لون زهري"] },
  { id: "cup-cherry", name: "كوب كرز", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-cherry.jpeg`, short: "رسومات كرز حمراء وأوراق خضراء", description: "كوب أبيض تزيّنه رسومات كرز حمراء مع أوراق خضراء.", notes: ["رسومات كرز", "لون أبيض"] },
  { id: "cup-pink-heart", name: "كوب قلب زهر", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-pink-heart.jpeg`, short: "قلوب زهرية على خلفية بيضاء", description: "كوب أبيض تزيّنه قلوب بلون زهري فاتح.", notes: ["قلوب زهرية", "لون أبيض"] },
  { id: "cup-red-heart", name: "كوب قلب أحمر", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-red-heart.jpeg`, short: "قلوب حمراء على خلفية بيضاء", description: "كوب أبيض تزيّنه قلوب حمراء موزّعة على سطحه.", notes: ["قلوب حمراء", "لون أبيض"] },
  { id: "cup-hearts-pink-band", name: "كوب قلوب وشريط زهري", category: "cups", price: 20, actualPrice: true, currency: "ILS", image: `${import.meta.env.BASE_URL}images/cup-hearts-pink-band.jpeg`, short: "قلوب حمراء وشريط زهري حول الكوب", description: "كوب أبيض بتصميم قلوب حمراء وشريط زهري مرسوم حول الجزء السفلي.", notes: ["قلوب حمراء", "شريط زهري مرسوم"] },
];

export const products: Product[] = [
  ...originalProducts.filter((p) => p.category !== "perfumes"),
  ...perfumeProducts,
  ...originalProducts.filter((p) => p.id === "perfume-white-musk").map((p) => ({
    ...p, name: "مسك أبيض — IBRAQ", englishName: "WHITE MUSK — IBRAQ",
    perItem: false, notes: [], short: "مسك أبيض — IBRAQ", description: "مسك أبيض — IBRAQ",
  })),
];

export const formatPrice = (n: number, language: Language = "ar") => `${n.toLocaleString(language === "ar" ? "ar-EG" : "en")}`;
export const formatProductPrice = (p: Product, quantity = 1, language: Language = "ar") =>
  `${formatPrice(p.price * quantity, language)} ${translate(language, "شيكل")}`;
