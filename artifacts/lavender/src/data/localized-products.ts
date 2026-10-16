import { categories, type Product } from "./products";
import { translate, type Language } from "@/i18n/messages";

// IDs, prices and images always come from the original catalog.
export const englishProducts: Record<string, { name: string; short: string; description: string }> = {
  "manicure-tool-set": {
    name: "Manicure tool set", short: "Nail care tool set",
    description: "MANICURE TOOL SET with the black tools and packaging pictured.",
  },
  "pearlmax-razors": {
    name: "PearlMax — Body razor pack", short: "PearlMax razors — 4 + 1 pack",
    description: "PearlMax body razors in the packaging pictured, with 4 razors + 1 free as labeled on the pack.",
  },
  "global-cotton-pads": {
    name: "GLOBAL — Makeup remover cotton pads", short: "Makeup remover cotton pads — 100 pads",
    description: "GLOBAL makeup remover cotton pads, a pack of 100. Good quality.",
  },
  "nail-file": {
    name: "Nail file", short: "Nail file in assorted colors",
    description: "PROFESSIONAL NAIL FILES nail file in the colors pictured.",
  },
  "sweet-beauty-makeup-brushes": {
    name: "Sweet beauty — Makeup brush set", short: "Makeup brush set in assorted colors",
    description: "Sweet beauty makeup brush set in the packaging and colors pictured.",
  },
  "mini-hair-straightener": {
    name: "Make Time — Mini hair straightener", short: "Pink mini hair straightener",
    description: "Pink Make Time mini hair straightener in the case pictured.",
  },
  "sadoer-strawberry-hand-cream": {
    name: "SADOER STRAWBERRY — Hand cream", short: "Strawberry hand cream",
    description: "SADOER STRAWBERRY hand cream in the pink packaging pictured.",
  },
  "brow-lash-kit": {
    name: "Brow & lash kit", short: "Brow & lash kit — Sweet beauty",
    description: "Sweet beauty eyebrow and eyelash tool kit in the packaging pictured.",
  },
  "body-razors": {
    name: "Body razors", short: "Pink body razors",
    description: "Body razors in the packaging pictured.",
  },
  "baby-powder-magic-scrub": {
    name: "LUENCO BABY POWDER MAGIC — SCRUB", short: "Scrub in a 200 ml container",
    description: "LUENCO BABY POWDER MAGIC scrub in the pictured 200 ml container.",
  },
  "essence-extreme-mascara": {
    name: "ESSENCE I LOVE EXTREME CRAZY VOLUME MASCARA", short: "ESSENCE mascara",
    description: "ESSENCE I LOVE EXTREME CRAZY VOLUME MASCARA in the pink packaging pictured.",
  },
  "lip-tint": {
    name: "LIP TINT", short: "Lip tint",
    description: "Lip tint in the bottles pictured.",
  },
  "rose-water": {
    name: "LUENCO Rose Water", short: "Rose water in a 300 ml bottle",
    description: "LUENCO Rose Water in the varieties pictured.",
  },
  "contour-palette": {
    name: "ROMANTIC COLOR — MAKEUP PLATE", short: "Contour palette with multiple shades",
    description: "ROMANTIC COLOR — MAKEUP PLATE contour palette, RC5124.",
  },
  "cup-small-red-hearts": {
    name: "Small red hearts cup", short: "White cup with small red hearts and a matching saucer",
    description: "A white cup decorated with small red hearts, with a matching saucer.",
  },
  "cup-blue-hearts-bows": {
    name: "Blue hearts & bows cup", short: "Blue hearts and pink bows with a matching saucer",
    description: "A white cup decorated with blue hearts and pink bows, with a matching saucer.",
  },
  "cup-blue-clouds": {
    name: "Blue clouds cup", short: "Blue cup with white clouds and a matching saucer",
    description: "A blue cup decorated with white clouds, with a matching saucer.",
  },
  "bouquet-turquoise": {
    name: "Bouquet with turquoise wrapping",
    short: "White and pink flowers with turquoise wrapping and a soft ribbon",
    description: "The bouquet pictured with turquoise wrapping. The price is for one bouquet. To request other colors, enter your preferred colors in the box below.",
  },
  "body-soap": {
    name: "Body soap", short: "Soap in a container with a pink lid",
    description: "Body soap as pictured. The price is for one container, not all the containers shown.",
  },
  "bodycare-bag": {
    name: "Body care bag", short: "Body care products in a small bag",
    description: "A bag of body care products as pictured. The price is for one bag, not all three bags.",
  },
  "candy-lotion": {
    name: "Candy, Sweet & Gummy body lotion", short: "Body lotion in white bottles with gold caps",
    description: "Sweet, Candy and Gummy body lotion. Browse the photos in the details to see all three varieties.",
  },
  "liquid-lipstick": {
    name: "GOLDEN ROSE — LONGSTAY LIQUID MATTE LIPSTICK", short: "Liquid matte lipstick in various colors",
    description: "GOLDEN ROSE — LONGSTAY LIQUID MATTE LIPSTICK.",
  },
  "perfume-qissa": {
    name: "Qissa perfumes", short: "Qissa perfume selection in the supplied photo",
    description: "A supplied photo of the Qissa perfume selection. The price is per item, not all the products pictured.",
  },
  "perfume-only-you": {
    name: "Only You perfume", short: "Only You perfume in the supplied photo",
    description: "Only You perfume as shown in the supplied photo. The price is per item, not a set of products.",
  },
  "perfume-selection": {
    name: "Perfume selection", short: "A selection including a purple perfume bottle",
    description: "A supplied photo of several perfumes, including a purple bottle. The price is for one item only, not the entire selection. Adding one to your bag means one item.",
  },
  "perfume-marshmallow": {
    name: "Marshmallow — perfume & body mist", short: "Perfume and body mist in the supplied photo",
    description: "A supplied photo of Marshmallow perfume and body mist. The price is for one item only, not the perfume and mist together.",
  },
  "perfume-white-musk": {
    name: "White Musk — IBRAQ", short: "White Musk in the supplied photo",
    description: "IBRAQ White Musk as shown in the supplied photo. The price is per item.",
  },
  "perfume-powder-musk": {
    name: "Powder Musk — IBRAQ", short: "Powder Musk in the supplied photo",
    description: "IBRAQ Powder Musk as shown in the supplied photo. The price is per item.",
  },
  "cup-bows-hearts": {
    name: "Hearts & bows cup", short: "Red hearts and brown bows on white",
    description: "A white cup decorated with red hearts and brown bows. The price is per cup.",
  },
  "cup-pink-butterflies": {
    name: "Pink butterflies cup", short: "Pink butterflies and little hearts",
    description: "A white cup decorated with pink butterflies and little hearts. The price is per cup.",
  },
  "cup-pink-clouds": {
    name: "Pink cloud cup", short: "White clouds on a pink cup",
    description: "A pink cup decorated with white clouds. The price is per cup.",
  },
  "cup-cherry": {
    name: "Cherry cup", short: "Red cherry illustrations and green leaves",
    description: "A white cup decorated with red cherry illustrations and green leaves.",
  },
  "cup-pink-heart": {
    name: "Pink heart cup", short: "Pink hearts on a white background",
    description: "A white cup decorated with light pink hearts.",
  },
  "cup-red-heart": {
    name: "Red heart cup", short: "Red hearts on a white background",
    description: "A white cup decorated with red hearts across its surface.",
  },
  "cup-hearts-pink-band": {
    name: "Hearts & pink band cup", short: "Red hearts and a pink band around the cup",
    description: "A white cup with red hearts and a painted pink band around the bottom.",
  },
};

export function localizeProduct(product: Product, language: Language): Product {
  if (language === "ar") return product;
  if (product.englishName) return { ...product, name: product.englishName, short: product.englishName, description: product.englishName };
  const copy = englishProducts[product.id];
  if (!copy) throw new Error(`Missing English catalog translation: ${product.id}`);
  return { ...product, ...copy, notes: product.notes.map((note) => translate(language, note)) };
}

export function localizedCategories(language: Language) {
  return categories.map((category) => ({
    ...category, label: translate(language, category.label), hint: translate(language, category.hint),
  }));
}