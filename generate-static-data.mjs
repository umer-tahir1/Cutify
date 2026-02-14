/**
 * generate-static-data.mjs
 * 
 * Reads the CUTIFY ASSETS folder and generates static JSON API data files
 * in public/api/ and symlinks (copies) assets to public/assets/.
 * 
 * Run: node generate-static-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_ROOT = path.resolve(__dirname, 'CUTIFY ASSETS/PROJECT CUTIFY');
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const PUBLIC_API = path.resolve(PUBLIC_DIR, 'api');
const PUBLIC_ASSETS = path.resolve(PUBLIC_DIR, 'assets');

// ── Product display names (from seed) ──
const productDisplayNames = {
  BC01: 'Kawaii Charm Bracelet - Pink',
  BC02: 'Kawaii Charm Bracelet - Blue',
  BC03: 'Heart Beaded Bracelet',
  BC04: 'Pastel Friendship Bracelet Set',
  ER01: 'Cute Animal Erasers Set',
  ER02: 'Fruit Shaped Mini Erasers',
  ER03: 'Sanrio Character Erasers',
  GB01: 'Kawaii Bear Geometry Box',
  GB02: 'Pastel Pink Geometry Box',
  GB03: 'Hello Kitty Geometry Box',
  GB04: 'Cinnamoroll Geometry Box',
  GB05: 'Kuromi Geometry Box',
  HL01: 'Mini Bear Highlighters Set',
  HL02: 'Pastel Flower Highlighters',
  HL03: 'Kawaii Animal Highlighters',
  KC01: 'Sanrio Family Keychain',
  KC02: 'Cute Bunny Keychain',
  KC03: 'Kawaii Cat Keychain',
  KC04: 'Star Moon Keychain',
  KC05: 'Hello Kitty Keychain',
  KC06: 'Cinnamoroll Keychain',
  KC07: 'My Melody Keychain',
  LB01: 'Double Layer Cute Lunch Box',
  LB02: 'Kawaii Bento Box - Pink',
  LB03: 'Sanrio Lunch Box Set',
  MD1: 'Cute Mini Pocket Diary',
  'LP 01': 'Kawaii LED Desk Lamp - Adjustable',
  'LP 02': 'Cute Animal Night Lamp',
  LP03: 'Mini Pastel Table Lamp',
  NP01: 'Kawaii Cat Notepad',
  NP02: 'Pastel Flower Notepad',
  NP03: 'Sanrio Character Notepad',
  NP04: 'Cute Bear Notepad Set',
  PN01: 'Cute Kawaii Gel Pens Set',
  SE01: 'Cute 2-in-1 Sharpener & Eraser',
  SE02: 'Animal Shape Sharpener + Eraser',
  SR01: 'Mini Kawaii Sharpener',
  SR02: 'Cute Desktop Sharpener',
  SR03: 'Pastel Animal Sharpener',
  SY01: 'Kawaii Slow Rise Squishy',
  SS01: 'Complete Kawaii Stationery Set',
  SS02: 'Pastel School Supplies Set',
  SS03: 'Cinnamoroll Stationery Set',
  SN01: 'Cute Animal Sticky Notes',
  SN02: 'Pastel Heart Sticky Notes',
  SN03: 'Kawaii Bear Sticky Notes Set',
  SN04: 'Flower Shape Sticky Notes',
  SN05: 'Mini Memo Sticky Notes Pack',
  SN06: 'Sanrio Sticky Memo Pad',
  SN07: 'Sanrio Tape Shape Sticky Notes - Blue',
  SN08: 'Sanrio Tape Shape Sticky Notes - Purple',
  WB01: 'Cute Kawaii Water Bottle - Large',
  WB02: 'Pastel Gradient Water Bottle',
  WB03: 'Sanrio Character Water Bottle',
  WB04: 'Mini Cute Water Bottle',
};

const productDescriptions = {
  BC01: 'Adorable kawaii charm bracelet in pink with cute character charms. Adjustable size fits most wrists.',
  BC02: 'Beautiful kawaii charm bracelet in sky blue with pastel charms. Perfect for everyday wear.',
  BC03: 'Heart-shaped beaded bracelet with pastel colors. A lovely gift for your bestie.',
  BC04: 'Set of friendship bracelets in pastel shades. Share with your besties!',
  ER01: 'Set of cute animal-shaped erasers in various colors. Fun and functional!',
  ER02: 'Mini fruit-shaped erasers that look adorable on your desk. Comes in assorted fruits.',
  ER03: 'Erasers featuring your favorite Sanrio characters. Collect them all!',
  GB01: 'Kawaii bear design geometry box with complete stationery. Perfect for school.',
  GB02: 'Pretty pastel pink geometry box with built-in compass and rulers.',
  GB03: 'Hello Kitty themed geometry box with all essential math tools.',
  GB04: 'Cinnamoroll character geometry box. Makes math more fun!',
  GB05: 'Kuromi themed geometry box with attitude and style.',
  HL01: 'Set of mini bear-shaped highlighters in pastel colors. Super cute for studying.',
  HL02: 'Flower-shaped highlighters in soft pastel shades. Perfect for journaling.',
  HL03: 'Kawaii animal highlighters that make note-taking adorable.',
  KC01: 'Sanrio family keychain with your favorite characters. Attach to bags or keys!',
  KC02: 'Cute bunny keychain with fluffy tail. Adorable bag charm.',
  KC03: 'Kawaii cat keychain with bell. Makes the cutest sound!',
  KC04: 'Star and moon themed keychain. Dreamy and aesthetic.',
  KC05: 'Hello Kitty keychain with ribbon. Classic and cute!',
  KC06: 'Cinnamoroll keychain with cloud detail. So fluffy and sweet!',
  KC07: 'My Melody keychain with flower. Pink perfection!',
  LB01: 'Double layer cute lunch box with dividers. Keeps food organized and fresh.',
  LB02: 'Kawaii bento box in lovely pink. Comes with utensils.',
  LB03: 'Sanrio themed lunch box set with matching bag. Perfect for school!',
  MD1: 'Cute mini pocket diary for notes and memories. Fits perfectly in your bag.',
  'LP 01': 'Adjustable kawaii LED desk lamp with multiple brightness levels. Available in blue and pink.',
  'LP 02': 'Cute animal-shaped night lamp with soft glow. Available in green and purple.',
  LP03: 'Mini pastel table lamp with warm light. Available in pink and yellow.',
  NP01: 'Kawaii cat design notepad. 50 sheets of quality paper.',
  NP02: 'Pastel flower notepad for quick notes. Beautiful design on every page.',
  NP03: 'Sanrio character notepad featuring cute illustrations.',
  NP04: 'Cute bear notepad set. Pack of 4 different designs.',
  PN01: 'Set of cute kawaii gel pens in assorted pastel colors. Smooth writing.',
  SE01: 'Cute 2-in-1 sharpener and eraser combo. Space saving and adorable!',
  SE02: 'Animal shaped sharpener with matching eraser. Fun for school!',
  SR01: 'Mini kawaii sharpener in cute design. Compact and portable.',
  SR02: 'Cute desktop sharpener with container. No mess, all cute!',
  SR03: 'Pastel animal-shaped sharpener. Makes sharpening fun!',
  SY01: 'Kawaii slow-rising squishy toy. Great stress reliever!',
  SS01: 'Complete kawaii stationery set with pens, pencils, eraser, ruler and more.',
  SS02: 'Pastel school supplies set. Everything you need for school in cute style.',
  SS03: 'Cinnamoroll stationery set with matching accessories.',
  SN01: 'Cute animal print sticky notes. 100 sheets per pad.',
  SN02: 'Pastel heart-shaped sticky notes. Express love in your notes!',
  SN03: 'Kawaii bear sticky notes set. Multiple sizes included.',
  SN04: 'Flower-shaped sticky notes in pastel colors. Beautiful on any notebook.',
  SN05: 'Mini memo sticky notes pack. Variety of cute designs.',
  SN06: 'Sanrio sticky memo pad with adorable character designs.',
  SN07: 'Sanrio family tape-shaped sticky notes in blue color theme.',
  SN08: 'Sanrio family tape-shaped sticky notes in purple color theme.',
  WB01: 'Large kawaii water bottle with straw. Keeps drinks cold for hours.',
  WB02: 'Beautiful pastel gradient water bottle. BPA-free and leak-proof.',
  WB03: 'Sanrio character water bottle with cute design. 500ml capacity.',
  WB04: 'Mini cute water bottle. Perfect size for your bag.',
};

const categoryPrices = {
  'CUTE BRACELETS': { min: 350, max: 650 },
  'CUTE ERASERS': { min: 150, max: 350 },
  'CUTE GEOMETRY BOXES': { min: 800, max: 1500 },
  'CUTE HIGHLIGHTERS': { min: 250, max: 500 },
  'CUTE KEYCHAINS': { min: 250, max: 550 },
  'CUTE LUNCH BOXES': { min: 900, max: 1800 },
  'CUTE MINI DIARIES': { min: 300, max: 600 },
  'CUTE MINI LAMPS': { min: 800, max: 1500 },
  'CUTE NOTEPADS': { min: 200, max: 450 },
  'CUTE PENS': { min: 250, max: 500 },
  'CUTE SHAPENER + ERASER': { min: 200, max: 400 },
  'CUTE SHARPENERS': { min: 150, max: 350 },
  'CUTE SQUISHYS': { min: 350, max: 700 },
  'CUTE STATIONERY SETS': { min: 700, max: 1500 },
  'CUTE STICKY NOTES': { min: 150, max: 350 },
  'CUTE WATER BOTTLES': { min: 600, max: 1200 },
};

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generatePrice(catName, idx) {
  const range = categoryPrices[catName] || { min: 300, max: 800 };
  const step = (range.max - range.min) / 3;
  const price = range.min + step * (idx % 4);
  return Math.round(price / 10) * 10;
}

function fakeId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Seeded random for consistent results
let _seed = 42;
function seededRandom() {
  _seed = (_seed * 16807) % 2147483647;
  return (_seed - 1) / 2147483646;
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
console.log('🚀 Generating static data for GitHub Pages...\n');

// 1. Copy assets
console.log('📁 Copying CUTIFY ASSETS to public/assets/...');
if (fs.existsSync(PUBLIC_ASSETS)) {
  fs.rmSync(PUBLIC_ASSETS, { recursive: true, force: true });
}
copyDirSync(ASSETS_ROOT, PUBLIC_ASSETS);
console.log('  ✅ Assets copied\n');

// 2. Generate data
console.log('📦 Generating product & category data...');
fs.mkdirSync(PUBLIC_API, { recursive: true });

const categories = [];
const allProducts = [];
const allReviews = [];

const categoryFolders = fs.readdirSync(ASSETS_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

for (let i = 0; i < categoryFolders.length; i++) {
  const folderName = categoryFolders[i];
  const catPath = path.join(ASSETS_ROOT, folderName);
  const productFolders = fs.readdirSync(catPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  if (productFolders.length === 0) continue;

  const displayName = folderName.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // Category image from first product
  const firstProdPath = path.join(catPath, productFolders[0]);
  const firstProdImages = fs.readdirSync(firstProdPath)
    .filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
    .sort();

  const mkUrl = (cat, prod, file) =>
    `/assets/${encodeURIComponent(cat)}/${encodeURIComponent(prod)}/${encodeURIComponent(file)}`;

  const catId = fakeId();
  const catSlug = slugify(displayName);
  const categoryImage = firstProdImages[0] ? mkUrl(folderName, productFolders[0], firstProdImages[0]) : '';
  const categoryHoverImage = firstProdImages[1] ? mkUrl(folderName, productFolders[0], firstProdImages[1]) : categoryImage;

  const category = {
    _id: catId,
    name: displayName,
    slug: catSlug,
    description: `Explore our adorable collection of ${displayName.toLowerCase()}`,
    image: categoryImage,
    hoverImage: categoryHoverImage,
    sortOrder: i + 1,
    isActive: true,
    productCount: 0,
  };

  // Products in this category
  for (let j = 0; j < productFolders.length; j++) {
    const prodFolder = productFolders[j];
    const prodPath = path.join(catPath, prodFolder);
    const imageFiles = fs.readdirSync(prodPath)
      .filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
      .sort();

    if (imageFiles.length === 0) continue;

    const images = imageFiles.map(img => mkUrl(folderName, prodFolder, img));
    const name = productDisplayNames[prodFolder] || prodFolder;
    const description = productDescriptions[prodFolder] || `Beautiful ${displayName.toLowerCase()} item. High quality and super cute!`;
    const price = generatePrice(folderName, j);
    const salePrice = j === 0 ? Math.round(price * 0.8 / 10) * 10 : undefined;
    const prodId = fakeId();
    const prodSlug = slugify(name);

    const product = {
      _id: prodId,
      name,
      description,
      price,
      salePrice,
      category: { _id: catId, name: displayName, slug: catSlug },
      sku: prodFolder.replace(/\s+/g, ''),
      slug: prodSlug,
      stock: 50 + Math.floor(seededRandom() * 200),
      images,
      rating: +(4 + seededRandom()).toFixed(1),
      reviewCount: Math.floor(seededRandom() * 200) + 10,
      isBestSeller: j === 0,
      isActive: true,
      tags: [catSlug, 'cute', 'kawaii', ...name.toLowerCase().split(' ').filter(w => w.length > 3)],
      createdAt: new Date(Date.now() - Math.floor(seededRandom() * 30) * 86400000).toISOString(),
    };

    allProducts.push(product);
  }

  category.productCount = allProducts.filter(p => p.category._id === catId).length;
  categories.push(category);
}

// Generate reviews for best sellers
const bestSellers = allProducts.filter(p => p.isBestSeller);
const reviewTexts = [
  { title: 'Absolutely love it!', text: 'The quality is amazing and its so cute! Will definitely order more. 💕' },
  { title: 'So adorable!', text: 'Exactly as shown in the pictures. Super happy with my purchase! ✨' },
  { title: 'Best purchase ever!', text: 'My daughter is obsessed! The quality exceeded my expectations. 🌸' },
  { title: 'Perfect gift!', text: 'Bought this as a gift and everyone loved it! So pretty and well-made. 💖' },
  { title: 'Love the quality!', text: 'Great value for money. The design is super cute and the quality is excellent! 🎀' },
];

for (let i = 0; i < Math.min(bestSellers.length, 5); i++) {
  allReviews.push({
    _id: fakeId(),
    user: { name: 'Sarah Miller' },
    product: bestSellers[i]._id,
    rating: 5,
    title: reviewTexts[i % reviewTexts.length].title,
    text: reviewTexts[i % reviewTexts.length].text,
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  });
}

// Add extra reviews for variety
const extraReviewers = ['Aisha K.', 'Fatima R.', 'Zara M.', 'Hina S.', 'Maira A.', 'Sana T.', 'Noor F.'];
const extraReviewTexts = [
  { title: 'Super cute!', text: 'Absolutely adorable! Bought for my desk and everyone asks where I got it. 🌟' },
  { title: 'Great quality', text: 'Really well made. The packaging was also super cute! Happy customer! 😊' },
  { title: 'Amazing product!', text: 'So happy with this purchase. The colors are even prettier in person! 💗' },
  { title: 'Highly recommend!', text: 'Fast delivery and amazing quality. Will definitely buy more from Cutify! 🎉' },
  { title: 'Worth every penny!', text: 'Such good quality for the price. My friends are jealous! 😍' },
];
for (let i = 0; i < bestSellers.length; i++) {
  for (let j = 0; j < 2; j++) {
    allReviews.push({
      _id: fakeId(),
      user: { name: extraReviewers[(i * 2 + j) % extraReviewers.length] },
      product: bestSellers[i]._id,
      rating: 4 + Math.round(seededRandom()),
      title: extraReviewTexts[(i + j) % extraReviewTexts.length].title,
      text: extraReviewTexts[(i + j) % extraReviewTexts.length].text,
      isVerifiedPurchase: true,
      isApproved: true,
      createdAt: new Date(Date.now() - (i * 2 + j + 5) * 86400000).toISOString(),
    });
  }
}

// ── Write JSON files ──

// /api/categories.json
fs.writeFileSync(
  path.join(PUBLIC_API, 'categories.json'),
  JSON.stringify({ data: { categories } }, null, 2)
);

// /api/products.json (all products)
fs.writeFileSync(
  path.join(PUBLIC_API, 'products.json'),
  JSON.stringify({ data: { products: allProducts, total: allProducts.length } }, null, 2)
);

// /api/best-sellers.json
fs.writeFileSync(
  path.join(PUBLIC_API, 'best-sellers.json'),
  JSON.stringify({ data: { products: bestSellers } }, null, 2)
);

// /api/reviews.json
fs.writeFileSync(
  path.join(PUBLIC_API, 'reviews.json'),
  JSON.stringify({ data: { reviews: allReviews } }, null, 2)
);

// Per-category product files: /api/category/<slug>.json
const catApiDir = path.join(PUBLIC_API, 'category');
fs.mkdirSync(catApiDir, { recursive: true });
for (const cat of categories) {
  const catProducts = allProducts.filter(p => p.category._id === cat._id);
  fs.writeFileSync(
    path.join(catApiDir, `${cat.slug}.json`),
    JSON.stringify({ data: { category: cat, products: catProducts } }, null, 2)
  );
}

// Per-product files: /api/product/<slug>.json
const prodApiDir = path.join(PUBLIC_API, 'product');
fs.mkdirSync(prodApiDir, { recursive: true });
for (const prod of allProducts) {
  // Attach reviews to the product
  const prodReviews = allReviews.filter(r => r.product === prod._id);
  fs.writeFileSync(
    path.join(prodApiDir, `${prod.slug}.json`),
    JSON.stringify({ data: { product: prod, reviews: prodReviews } }, null, 2)
  );
  // Also by _id
  fs.writeFileSync(
    path.join(prodApiDir, `${prod._id}.json`),
    JSON.stringify({ data: { product: prod, reviews: prodReviews } }, null, 2)
  );
}

// Per-category slug -> id mapping (for all category file lookups by _id too)
for (const cat of categories) {
  fs.writeFileSync(
    path.join(catApiDir, `${cat._id}.json`),
    JSON.stringify({ data: { category: cat, products: allProducts.filter(p => p.category._id === cat._id) } }, null, 2)
  );
}

console.log(`  ✅ ${categories.length} categories`);
console.log(`  ✅ ${allProducts.length} products`);
console.log(`  ✅ ${allReviews.length} reviews`);
console.log(`  ✅ JSON files written to public/api/\n`);

console.log('🎉 Static data generation complete!');
console.log(`   Site will serve from public/ at build time.\n`);
