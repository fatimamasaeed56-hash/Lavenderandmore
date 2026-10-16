import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

// Load the actual TS/TSX modules without starting Vite or a browser.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requirePackage = createRequire(resolve(root, "package.json"));
const cache = new Map();
function load(relative) {
  let file = resolve(root, relative);
  if (!existsSync(file)) file = [".ts", ".tsx"].map((ext) => file + ext).find(existsSync);
  assert.ok(file, `Cannot resolve ${relative}`);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = readFileSync(file, "utf8").replaceAll("import.meta.env.BASE_URL", '"/"');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const require = (id) => id.startsWith("@/") ? load(`src/${id.slice(2)}`)
    : id.startsWith(".") ? load(resolve(dirname(file), id)) : requirePackage(id);
  new Function("require", "module", "exports", compiled)(require, module, module.exports);
  return module.exports;
}

const { english, translate, LANGUAGE_STORAGE_KEY, isLanguage } = load("src/i18n/messages.ts");
const { products, categories, formatProductPrice, productVolumeLabel } = load("src/data/products.ts");
const { localizeProduct, localizedCategories, englishProducts } = load("src/data/localized-products.ts");
const { buildOrderMessage, normalizePhone } = load("src/components/whatsapp-order.tsx");
const { bagKey, bagColors, bagProductId } = load("src/hooks/use-store.ts");

test("auth starts outside an embedded preview and reports blocked tabs", () => {
  const { navigateToAuth } = load("../../lib/replit-auth-web/src/use-auth.ts");
  const previous = globalThis.window;
  const top = {};
  const assigned = [];
  const opened = [];
  const tab = { opener: {} };
  try {
    globalThis.window = {
      self: top, top,
      location: { origin: "https://shop.example", assign: (url) => assigned.push(url) },
      open: (url, target) => { opened.push({ url, target }); return tab; },
    };
    navigateToAuth("/api/login?returnTo=%2F");
    assert.deepEqual(assigned, ["https://shop.example/api/login?returnTo=%2F"]);
    assert.equal(opened.length, 0);
    globalThis.window.self = {};
    navigateToAuth("/api/login?returnTo=%2F");
    assert.deepEqual(opened, [{ url: assigned[0], target: "_blank" }]);
    assert.equal(tab.opener, null);
    globalThis.window.open = () => null;
    assert.throws(() => navigateToAuth("/api/login"), /blocked/);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test("cup catalog contains ten unique designs at 20 ILS with real images and bilingual buy labels", () => {
  const cups = products.filter((p) => p.category === "cups");
  assert.equal(cups.length, 10);
  assert.equal(new Set(cups.map((p) => p.id)).size, cups.length);
  assert.equal(new Set(cups.map((p) => p.image)).size, cups.length);
  for (const p of cups) {
    assert.equal(p.price, 20);
    assert.equal(p.currency, "ILS");
    assert.ok(existsSync(resolve(root, "public", p.image.slice(1))));
    assert.equal(formatProductPrice(p, 2, "en"), "40 ILS");
  }
  assert.equal(translate("ar", "شراء"), "شراء");
  assert.equal(translate("en", "شراء"), "Buy");
});

test("PearlMax razors are a separate body care pack priced at 5 ILS", () => {
  const product = products.find((p) => p.id === "pearlmax-razors");
  assert.ok(product);
  assert.equal(product.category, "bodycare");
  assert.equal(product.price, 5);
  assert.equal(product.suppliedPhoto, true);
  assert.ok(product.image.endsWith("/images/pearlmax-razors.jpeg"));
  assert.equal(products.find((p) => p.id === "body-razors").price, 10);
});

test("cosmetics contains only the replacement products with per-item pricing", () => {
  const cosmetics = products.filter((p) => p.category === "cosmetics" && p.variantGroup !== "lip-liner-shades");
  const prices = { "global-cotton-pads": 10, "nail-file": 5, "sweet-beauty-makeup-brushes": 10, "mini-hair-straightener": 15, "sadoer-strawberry-hand-cream": 2, "brow-lash-kit": 10, "contour-palette": 5, "essence-extreme-mascara": 10, "lip-tint": 2, "liquid-lipstick": 5, "rose-water": 10 };
  assert.deepEqual(cosmetics.map((p) => p.id).sort(), Object.keys(prices).sort());
  for (const p of cosmetics) {
    assert.equal(p.price, prices[p.id]);
    assert.equal(p.perItem ?? false, false);
  }
  assert.ok(!products.some((p) => ["blush", "lipstick-stick"].includes(p.id)));
});

test("lip liner shades are individually orderable at 3 ILS with one catalog card", () => {
  const shades = products.filter((p) => p.variantGroup === "lip-liner-shades");
  assert.deepEqual(shades.map((p) => p.id), [277, 281, 209, 245, 231].map((shade) => `lip-liner-${shade}`));
  assert.equal(shades.filter((p) => !p.hiddenFromCatalog).length, 1);
  for (const p of shades) {
    assert.equal(p.price, 3);
    assert.equal(p.category, "cosmetics");
    assert.ok(existsSync(resolve(root, "public", p.image.slice(1))));
    assert.equal(bagProductId(bagKey(p.id)), p.id);
    assert.ok(buildOrderMessage("en", [{ id: p.id, p: localizeProduct(p, "en"), n: 1 }], { name: "", phone: "", address: "", notes: "", mapUrl: "" }).includes(p.englishName));
  }
});

test("body care packages have one catalog card and four independently orderable options", () => {
  const options = products.filter((p) => p.variantGroup === "bodycare-packages");
  assert.equal(options.length, 4);
  assert.equal(options.filter((p) => !p.hiddenFromCatalog).length, 1);
  assert.equal(new Set(options.map((p) => p.id)).size, 4);
  for (const p of options) {
    assert.equal(p.price, 25);
    assert.equal(p.category, "bodycare");
    assert.ok(existsSync(resolve(root, "public", p.image.slice(1))));
    assert.equal(bagProductId(bagKey(p.id)), p.id);
    assert.ok(buildOrderMessage("en", [{ id: p.id, p: localizeProduct(p, "en"), n: 1 }], { name: "", phone: "", address: "", notes: "", mapUrl: "" }).includes(localizeProduct(p, "en").name));
  }
});

test("English covers all fixed Arabic UI literals and catalog notes", () => {
  for (const path of [
    "src/App.tsx", "src/pages/home.tsx", "src/pages/auth.tsx", "src/pages/not-found.tsx",
    "src/components/category-feedback.tsx", "src/components/delivery-location.tsx",
    "src/components/whatsapp-order.tsx", "src/components/error-boundary.tsx",
  ]) {
    const source = ts.createSourceFile(path, readFileSync(resolve(root, path), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isStringLiteral(node) && /[\u0621-\u064a\u0660-\u0669]/u.test(node.text)) {
        assert.ok(english[node.text], `Missing UI translation in ${path}: ${node.text}`);
      }
      if (ts.isJsxText(node) && /[\u0621-\u064a]/u.test(node.text)) {
        assert.fail(`Unlocalized JSX text in ${path}: ${node.text}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  for (const p of products) for (const note of p.notes) assert.ok(english[note]);
  for (const c of categories) {
    assert.ok(english[c.label]);
    assert.ok(english[c.hint]);
  }
});

test("catalog localization is complete, reversible and does not mutate commerce data", () => {
  const before = JSON.stringify(products);
  assert.ok(products.every((p) => p.englishName || englishProducts[p.id]), "Every active product has English copy");
  for (const p of products) {
    const en = localizeProduct(p, "en");
    for (const key of ["id", "category", "price", "image", "currency", "perItem"]) assert.equal(en[key], p[key]);
    assert.ok(en.name && en.short && en.description);
    assert.doesNotMatch([en.name, en.short, en.description, ...en.notes].join(" "), /[\u0621-\u064a]/u);
    assert.equal(localizeProduct(p, "ar"), p);
    assert.equal(formatProductPrice(p, 2, "en"), `${p.price * 2} ILS`);
  }
  assert.equal(JSON.stringify(products), before);
  assert.deepEqual(localizedCategories("ar").map((c) => c.label), categories.map((c) => c.label));
  assert.equal(productVolumeLabel(products.find((p) => p.id === "perfume-only-you"), "en"), "Bottle size: 30 ml");
});

test("perfumes have single-product images, confirmed sizes, prices and a deduplicated gallery", () => {
  const perfumes = products.filter((p) => p.category === "perfumes");
  assert.equal(new Set(perfumes.map((p) => p.id)).size, perfumes.length);
  assert.ok(!perfumes.some((p) => ["perfume-selection", "perfume-marshmallow"].includes(p.id)));
  for (const p of perfumes) {
    assert.equal(p.name, p.name.toUpperCase());
    assert.equal(localizeProduct(p, "en").name, localizeProduct(p, "en").name.toUpperCase());
    assert.equal(p.perItem ?? false, false);
    for (const photo of [p.image, ...(p.images ?? [])]) {
      assert.ok(existsSync(resolve(root, "public", photo.slice(1))), photo);
    }
    assert.equal(new Set(p.images).size, p.images?.length ?? 0);
  }
  for (const id of ["cookie-crave", "vanilla-freak", "whipped-pleasure", "berry-on-top"]) {
    const p = products.find((p) => p.id === `perfume-${id}`);
    assert.equal(p.price, 55);
    assert.equal(p.volumeMl, 75);
  }
  const powder = products.find((p) => p.id === "perfume-powder-musk");
  assert.equal(products.find((p) => p.id === "perfume-fatima").name, "فاطمة");
  assert.equal(products.find((p) => p.id === "perfume-only-you").name, "عطر ONLY YOU");
  assert.equal(powder.volumeMl, 75);
  assert.equal(powder.images.length, 2);
  assert.equal(powder.images[0], powder.image);
});

test("WhatsApp fixed text follows the language while customer text, colors and actual totals stay intact", () => {
  const p = products.find((p) => p.id === "bouquet-turquoise");
  const colors = "أبيض وبنفسجي / white & purple";
  const id = bagKey(p.id, colors);
  const details = { name: "سارة Jane", phone: "+972599123456", address: "رام الله، شارع 5", notes: "اتصل قبل الوصول please", mapUrl: "https://www.google.com/maps?q=31,35" };
  const items = [{ id, p, n: 2 }];
  const ar = buildOrderMessage("ar", items, details);
  const en = buildOrderMessage("en", items, details);
  assert.match(ar, /مرحباً Lavender & More/);
  assert.ok(ar.includes(p.name));
  assert.match(ar, /مجموع المنتجات: 160 شيكل \(لا يشمل التوصيل\)/);
  assert.match(en, /Hello Lavender & More/);
  assert.match(en, /Quantity: 2 — Unit price: 80 ILS — Total: 160 ILS/);
  assert.match(en, /Product subtotal: 160 ILS \(excluding delivery\)/);
  for (const value of [...Object.values(details), colors]) {
    assert.ok(ar.includes(value));
    assert.ok(en.includes(value));
  }
  assert.equal(bagColors(id), colors);
  assert.equal(normalizePhone("+٩٧٢٥٩٩۱۲۳۴۵۶"), details.phone);
  assert.equal(items[0].p, p);
});

test("provider defaults to Arabic and honors only valid remembered choices", () => {
  const React = requirePackage("react");
  const { renderToStaticMarkup } = requirePackage("react-dom/server");
  const { LanguageProvider, useLanguage } = load("src/i18n/context.tsx");
  function Probe() {
    const { language, dir, t } = useLanguage();
    return React.createElement("p", { lang: language, dir }, t("المتجر"));
  }
  for (const [saved, language, dir, label] of [
    [null, "ar", "rtl", "المتجر"], ["en", "en", "ltr", "Shop"],
    ["ar", "ar", "rtl", "المتجر"], ["invalid", "ar", "rtl", "المتجر"],
  ]) {
    globalThis.localStorage = { getItem: (key) => { assert.equal(key, LANGUAGE_STORAGE_KEY); return saved; } };
    assert.equal(renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(Probe))), `<p lang="${language}" dir="${dir}">${label}</p>`);
  }
  delete globalThis.localStorage;
  assert.ok(isLanguage("ar") && isLanguage("en"));
  assert.equal(isLanguage("invalid"), false);
  assert.equal(translate("ar", "المتجر"), "المتجر");
});