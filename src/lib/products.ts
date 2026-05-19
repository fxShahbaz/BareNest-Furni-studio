export type Material = "Solid Wood" | "MDF";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category:
    | "beds"
    | "wardrobes"
    | "dressing"
    | "sofas"
    | "dining"
    | "crockery"
    | "bookshelves"
    | "shoerack"
    | "office"
    | "conference";
  material: Material;
  price: number;
  /** GST percentage (e.g. 18 for 18%). Optional on legacy seed data; defaults to 18. */
  gst_rate?: number;
  /** true = listed price already includes GST. Defaults to true. */
  tax_inclusive?: boolean;
  /** HSN code for the GST tax invoice. Free-text, optional. */
  hsn_code?: string;
  dimensions: string;
  features: string[];
  images: string[];
};

export type FurnishingItem = {
  slug: string;
  name: string;
  category:
    | "pots"
    | "chandeliers"
    | "curtains"
    | "showpieces"
    | "idols"
    | "bedsheets"
    | "mats";
  price: number;
  image: string;
};

const W = (seed: string, w = 1200, h = 900) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const PRODUCTS: Product[] = [
  {
    slug: "kasha-storage-bed",
    name: "Kasha Storage Bed",
    tagline: "Hydraulic storage. Walnut frame.",
    description:
      "A queen-size storage bed in seasoned sheesham with a slow-close hydraulic lift. Designed for small bedrooms that need to hold a lot quietly.",
    category: "beds",
    material: "Solid Wood",
    price: 64900,
    dimensions: "78\" × 60\" × 36\"",
    features: ["Hydraulic lift storage", "Solid sheesham frame", "Slatted base"],
    images: [
      "photo-1646061142491-fc141798ba14",
      "photo-1540518614846-7eded433c457",
      "photo-1505693416388-ac5ce068fe85",
    ].map((s) => W(s)),
  },
  {
    slug: "nila-platform-bed",
    name: "Nila Platform Bed",
    tagline: "Low-profile. No storage. Pure line.",
    description:
      "A clean, low platform bed crafted in MDF with a matte oak veneer. Designed for a calm bedroom that wants nothing in the way.",
    category: "beds",
    material: "MDF",
    price: 32900,
    dimensions: "78\" × 60\" × 14\"",
    features: ["MDF with oak veneer", "Slatted base", "Tool-free assembly"],
    images: [
      "photo-1617325247661-675ab4b64ae2",
      "photo-1601628828688-632f38a5a7d0",
      "photo-1616594039964-ae9021a400a0",
    ].map((s) => W(s)),
  },
  {
    slug: "linden-wardrobe",
    name: "Linden 3-Door Wardrobe",
    tagline: "Soft-close. Cedar lined.",
    description:
      "A tall three-door wardrobe with brushed brass handles. Cedar-lined interior keeps wool calm through the summer.",
    category: "wardrobes",
    material: "Solid Wood",
    price: 78900,
    dimensions: "72\" × 24\" × 84\"",
    features: ["Cedar-lined interior", "Soft-close hinges", "Brushed brass pulls"],
    images: [
      "photo-1672137233327-37b0c1049e77",
      "photo-1601628828688-632f38a5a7d0",
    ].map((s) => W(s)),
  },
  {
    slug: "mira-dressing-table",
    name: "Mira Dressing Table",
    tagline: "Fluted MDF. Round mirror.",
    description:
      "A compact dressing table with a fluted MDF front, soft round mirror, and a single drawer with felt lining.",
    category: "dressing",
    material: "MDF",
    price: 18900,
    dimensions: "36\" × 18\" × 60\"",
    features: ["Fluted front", "Felt-lined drawer", "Round mirror"],
    images: ["photo-1551723454-7565a1f5b161"].map((s) => W(s)),
  },
  {
    slug: "olin-three-seater",
    name: "Olin 3-Seater Sofa",
    tagline: "Goose-feather seat. Linen blend.",
    description:
      "A deep three-seater with a sheesham frame, goose-feather seat cushions, and a heavyweight linen blend in oat.",
    category: "sofas",
    material: "Solid Wood",
    price: 89900,
    dimensions: "84\" × 36\" × 32\"",
    features: ["Sheesham frame", "Feather seats", "Removable covers"],
    images: [
      "photo-1555041469-a586c61ea9bc",
      "photo-1493663284031-b7e3aefcae8e",
    ].map((s) => W(s)),
  },
  {
    slug: "ferro-dining-six",
    name: "Ferro 6-Seater Dining",
    tagline: "Solid mango. Live edge.",
    description:
      "A live-edge mango wood dining table, finished with a low-sheen hardwax oil. Seats six comfortably, eight at a squeeze.",
    category: "dining",
    material: "Solid Wood",
    price: 96900,
    dimensions: "78\" × 38\" × 30\"",
    features: ["Live-edge top", "Hardwax oil finish", "Steel cross base"],
    images: [
      "photo-1577140917170-285929fb55b7",
      "photo-1567538096630-e0c55bd6374c",
    ].map((s) => W(s)),
  },
  {
    slug: "vellore-crockery",
    name: "Vellore Crockery Unit",
    tagline: "Glass panes. Walnut frame.",
    description:
      "A four-door crockery unit with glass upper panes and walnut lowers. Adjustable shelves, soft inner LED.",
    category: "crockery",
    material: "MDF",
    price: 54900,
    dimensions: "60\" × 18\" × 78\"",
    features: ["Glass uppers", "LED interior", "Adjustable shelves"],
    images: ["photo-1765000884377-5134d3dc9d15"].map((s) => W(s)),
  },
  {
    slug: "ash-bookshelf",
    name: "Ash Open Bookshelf",
    tagline: "Five shelves. No backing.",
    description:
      "An open ash bookshelf with five shelves and no backing — designed to be seen from both sides.",
    category: "bookshelves",
    material: "Solid Wood",
    price: 42900,
    dimensions: "48\" × 14\" × 72\"",
    features: ["Open back", "Five shelves", "Solid ash"],
    images: ["photo-1594620302200-9a762244a156"].map((s) => W(s)),
  },
  {
    slug: "tako-shoe-rack",
    name: "Tako Shoe Rack",
    tagline: "Tip-out drawers. 18 pairs.",
    description:
      "A slim hallway shoe rack with three tip-out drawers, holding up to 18 pairs.",
    category: "shoerack",
    material: "MDF",
    price: 14900,
    dimensions: "36\" × 10\" × 42\"",
    features: ["Tip-out drawers", "Wall-anchor included", "Slim footprint"],
    images: ["photo-1583845112203-29329902332e"].map((s) => W(s)),
  },
  {
    slug: "halden-office-desk",
    name: "Halden Office Desk",
    tagline: "Cable trough. Two drawers.",
    description:
      "A 60-inch office desk with an integrated cable trough, two soft-close drawers, and a matte oak top.",
    category: "office",
    material: "MDF",
    price: 36900,
    dimensions: "60\" × 28\" × 30\"",
    features: ["Cable trough", "Two soft-close drawers", "Matte oak top"],
    images: ["photo-1593062096033-9a26b09da705"].map((s) => W(s)),
  },
  {
    slug: "consilio-conference",
    name: "Consilio Conference Table",
    tagline: "Seats ten. Grommet ports.",
    description:
      "A ten-seater conference table in solid teak with two flush grommet power ports.",
    category: "conference",
    material: "Solid Wood",
    price: 184900,
    dimensions: "120\" × 48\" × 30\"",
    features: ["Solid teak", "Flush grommets", "Tapered legs"],
    images: ["photo-1679309981674-cef0e23a7864"].map((s) => W(s)),
  },
];

export const FURNISHINGS: FurnishingItem[] = [
  {
    slug: "umber-planter",
    name: "Umber Stoneware Planter",
    category: "pots",
    price: 2900,
    image: W("photo-1771627278991-8922851b9435"),
  },
  {
    slug: "halo-chandelier",
    name: "Halo Brass Chandelier",
    category: "chandeliers",
    price: 18900,
    image: W("photo-1588436199489-ac376a0b3884"),
  },
  {
    slug: "muslin-drape",
    name: "Muslin Pleated Drape",
    category: "curtains",
    price: 4200,
    image: W("photo-1574197635162-68e4b468e4e9"),
  },
  {
    slug: "linen-bedsheet",
    name: "Stonewashed Linen Sheet",
    category: "bedsheets",
    price: 5400,
    image: W("photo-1505693416388-ac5ce068fe85"),
  },
  {
    slug: "block-print-mat",
    name: "Block-Print Dining Mat",
    category: "mats",
    price: 1200,
    image: W("photo-1761501597515-252646db6b41"),
  },
  {
    slug: "brass-ganesha",
    name: "Brass Ganesha Idol",
    category: "idols",
    price: 6900,
    image: W("photo-1760857067352-5fb8d6e9245f"),
  },
];

export const CATEGORIES: { id: Product["category"]; label: string }[] = [
  { id: "beds", label: "Beds" },
  { id: "wardrobes", label: "Wardrobes" },
  { id: "dressing", label: "Dressing tables" },
  { id: "sofas", label: "Sofas" },
  { id: "dining", label: "Dining tables" },
  { id: "crockery", label: "Crockery units" },
  { id: "bookshelves", label: "Bookshelves" },
  { id: "shoerack", label: "Shoe racks" },
  { id: "office", label: "Office tables" },
  { id: "conference", label: "Conference tables" },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
