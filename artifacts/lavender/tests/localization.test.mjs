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
const { bagKey, bagColors } = load("src/hooks/use-store.ts");

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
  assert.equal(Object.keys(englishProducts).length, products.length);
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
  assert.equal(productVolumeLabel(products.find((p) => p.id === "perfume-only-you"), "en"), "Bottle size: 50 ml");
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