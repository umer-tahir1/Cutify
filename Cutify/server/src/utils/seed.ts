import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Review } from '../models/Review';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cutify';

// Path to the assets folder (relative to project root)
const ASSETS_ROOT = path.resolve(__dirname, '../../../CUTIFY ASSETS/PROJECT CUTIFY');

// Nice display names for SKU-based product folders
const productDisplayNames: Record<string, string> = {
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

const productDescriptions: Record<string, string> = {
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

const categoryPrices: Record<string, { min: number; max: number }> = {
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

function generatePrice(catName: string, idx: number): number {
  const range = categoryPrices[catName] || { min: 300, max: 800 };
  const step = (range.max - range.min) / 3;
  const price = range.min + step * (idx % 4);
  return Math.round(price / 10) * 10;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    if (!fs.existsSync(ASSETS_ROOT)) {
      console.error('❌ CUTIFY ASSETS folder not found at:', ASSETS_ROOT);
      process.exit(1);
    }

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // ==================== SEED USERS ====================
    console.log('👤 Creating users...');
    const admin = await User.create({
      name: 'Cutify Admin',
      email: 'admin@cutify.com',
      password: 'Admin@123456',
      role: 'superadmin',
      isActive: true,
      emailVerified: true,
    });

    const testUser = await User.create({
      name: 'Sarah Miller',
      email: 'sarah@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
      emailVerified: true,
      addresses: [{
        label: 'Home',
        fullName: 'Sarah Miller',
        phone: '+92 3001234567',
        street: '123 Gulberg III',
        city: 'Lahore',
        state: 'Punjab',
        zipCode: '54000',
        country: 'Pakistan',
        isDefault: true,
      }],
    });

    console.log('  ✅ Admin: admin@cutify.com / Admin@123456');
    console.log('  ✅ User: sarah@example.com / User@123456');

    // ==================== READ FOLDER STRUCTURE ====================
    console.log('📁 Reading CUTIFY ASSETS folder...');
    const categoryFolders = fs.readdirSync(ASSETS_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    console.log(`   Found ${categoryFolders.length} category folders`);

    // ==================== SEED CATEGORIES ====================
    console.log('📂 Creating categories...');
    const categoryDocs: { doc: any; folderName: string }[] = [];

    for (let i = 0; i < categoryFolders.length; i++) {
      const folderName = categoryFolders[i];
      const catPath = path.join(ASSETS_ROOT, folderName);
      const productFolders = fs.readdirSync(catPath, { withFileTypes: true })
        .filter((d) => d.isDirectory());

      if (productFolders.length === 0) {
        console.log(`   ⏭️  Skipping empty category: ${folderName}`);
        continue;
      }

      const displayName = folderName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      // Use first product's first image as category image
      const firstProduct = productFolders[0].name;
      const firstProductPath = path.join(catPath, firstProduct);
      const firstProdImages = fs.readdirSync(firstProductPath)
        .filter((f) => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
        .sort();
      const mkAssetUrl = (cat: string, prod: string, file: string) =>
        `/assets/${encodeURIComponent(cat)}/${encodeURIComponent(prod)}/${encodeURIComponent(file)}`;
      const categoryImage = firstProdImages[0]
        ? mkAssetUrl(folderName, firstProduct, firstProdImages[0])
        : '';
      const categoryHoverImage = firstProdImages[1]
        ? mkAssetUrl(folderName, firstProduct, firstProdImages[1])
        : categoryImage;

      const cat = await Category.create({
        name: displayName,
        description: `Explore our adorable collection of ${displayName.toLowerCase()}`,
        image: categoryImage,
        hoverImage: categoryHoverImage,
        sortOrder: i + 1,
        isActive: true,
      });

      categoryDocs.push({ doc: cat, folderName });
      console.log(`   ✅ ${displayName} (${productFolders.length} products)`);
    }

    console.log(`  ✅ ${categoryDocs.length} categories created`);

    // ==================== SEED PRODUCTS ====================
    console.log('🛍️  Creating products...');
    let totalProducts = 0;
    let totalImages = 0;
    const allProducts: any[] = [];

    for (const { doc: category, folderName } of categoryDocs) {
      const catPath = path.join(ASSETS_ROOT, folderName);
      const productFolders = fs.readdirSync(catPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();

      for (let i = 0; i < productFolders.length; i++) {
        const prodFolder = productFolders[i];
        const prodPath = path.join(catPath, prodFolder);

        const imageFiles = fs.readdirSync(prodPath)
          .filter((f) => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
          .sort();

        if (imageFiles.length === 0) continue;

        const images = imageFiles.map(
          (img) => `/assets/${encodeURIComponent(folderName)}/${encodeURIComponent(prodFolder)}/${encodeURIComponent(img)}`
        );

        const name = productDisplayNames[prodFolder] || prodFolder;
        const description = productDescriptions[prodFolder] || `Beautiful ${category.name.toLowerCase()} item. High quality and super cute!`;
        const price = generatePrice(folderName, i);
        const salePrice = i === 0 ? Math.round(price * 0.8 / 10) * 10 : undefined;

        const product = await Product.create({
          name,
          description,
          price,
          salePrice,
          category: category._id,
          sku: prodFolder.replace(/\s+/g, ''),
          stock: 50 + Math.floor(Math.random() * 200),
          images,
          rating: +(4 + Math.random()).toFixed(1),
          reviewCount: Math.floor(Math.random() * 200) + 10,
          isBestSeller: i === 0,
          isActive: true,
          tags: [
            slugify(category.name),
            'cute',
            'kawaii',
            ...name.toLowerCase().split(' ').filter((w) => w.length > 3),
          ],
        });

        allProducts.push(product);
        totalProducts++;
        totalImages += imageFiles.length;
      }

      // Update category product count
      const count = allProducts.filter(
        (p) => p.category.toString() === category._id.toString()
      ).length;
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }

    console.log(`  ✅ ${totalProducts} products created with ${totalImages} images`);

    // ==================== SEED COUPONS ====================
    console.log('🎟️  Creating coupons...');
    const coupons = await Coupon.create([
      {
        code: 'CUTIFY10',
        description: 'Get 10% off on your order',
        type: 'percentage',
        value: 10,
        minOrderAmount: 500,
        maxDiscount: 200,
        usageLimit: 1000,
        perUserLimit: 3,
        startsAt: new Date(),
        expiresAt: new Date('2027-12-31'),
      },
      {
        code: 'WELCOME20',
        description: 'Welcome discount - 20% off first order',
        type: 'percentage',
        value: 20,
        minOrderAmount: 300,
        maxDiscount: 500,
        usageLimit: 0,
        perUserLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date('2027-12-31'),
      },
      {
        code: 'FLAT100',
        description: 'Flat 100 PKR off on orders above 999 PKR',
        type: 'fixed',
        value: 100,
        minOrderAmount: 999,
        usageLimit: 500,
        perUserLimit: 2,
        startsAt: new Date(),
        expiresAt: new Date('2027-06-30'),
      },
      {
        code: 'SUMMER25',
        description: 'Summer sale - 25% off',
        type: 'percentage',
        value: 25,
        minOrderAmount: 700,
        maxDiscount: 750,
        usageLimit: 200,
        perUserLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date('2026-08-31'),
      },
    ]);

    console.log(`  ✅ ${coupons.length} coupons created`);

    // ==================== SEED REVIEWS ====================
    console.log('⭐ Creating reviews...');
    const reviewTargets = allProducts.filter((p) => p.isBestSeller).slice(0, 5);
    const reviewTexts = [
      { title: 'Absolutely love it!', text: 'The quality is amazing and its so cute! Will definitely order more. 💕' },
      { title: 'So adorable!', text: 'Exactly as shown in the pictures. Super happy with my purchase! ✨' },
      { title: 'Best purchase ever!', text: 'My daughter is obsessed! The quality exceeded my expectations. 🌸' },
      { title: 'Perfect gift!', text: 'Bought this as a gift and everyone loved it! So pretty and well-made. 💖' },
      { title: 'Love the quality!', text: 'Great value for money. The design is super cute and the quality is excellent! 🎀' },
    ];

    const reviews = [];
    for (let i = 0; i < reviewTargets.length; i++) {
      reviews.push(await Review.create({
        user: testUser._id,
        product: reviewTargets[i]._id,
        rating: 5,
        title: reviewTexts[i].title,
        text: reviewTexts[i].text,
        isVerifiedPurchase: true,
        isApproved: true,
      }));
    }

    console.log(`  ✅ ${reviews.length} reviews created`);

    // ==================== DONE ====================
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Summary:');
    console.log(`   Users: 2 (1 admin, 1 test user)`);
    console.log(`   Categories: ${categoryDocs.length}`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Images: ${totalImages}`);
    console.log(`   Coupons: ${coupons.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@cutify.com / Admin@123456');
    console.log('   User:  sarah@example.com / User@123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
