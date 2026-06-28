// Idempotent demo seed: a "Rozhna Beauty" store, a "Skincare" category, and a
// few in-stock skincare products (with skinType/ingredients attributes) so the
// AI assistant has real items to recommend. Safe to re-run.
//   Run:  node scripts/seed-skincare-samples.js   (from the backend/ folder)
// Remove the samples later from the dashboard, or by deleting these SKUs.
const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const url = (env.match(/^DATABASE_URL\s*=\s*(.+?)\s*$/m) || [])[1]?.replace(/^["']|["']$/g, '');
process.env.DATABASE_URL = url;
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const PRODUCTS = [
  {
    sku: 'RZ-MOIST-001',
    name: 'AquaLight Oil-Free Gel Moisturizer',
    description:
      'Lightweight oil-free gel moisturizer for oily, combination and sensitive skin. Hydrates with hyaluronic acid and niacinamide without feeling greasy or clogging pores — great under makeup in hot, dry weather.',
    priceCents: 12000,
    stock: 25,
    attributes: { skinType: ['oily', 'combination', 'sensitive'], ingredients: 'Aqua, Hyaluronic Acid, Niacinamide, Glycerin' },
  },
  {
    sku: 'RZ-CLNS-001',
    name: 'PureCalm Gentle Foaming Cleanser',
    description:
      'Soap-free gentle foaming cleanser for sensitive and oily skin. Removes makeup, oil and impurities without stripping or tightness. Use morning and night.',
    priceCents: 9000,
    stock: 30,
    attributes: { skinType: ['oily', 'sensitive', 'combination'], ingredients: 'Aqua, Ceramides, Panthenol, Glycerin' },
  },
  {
    sku: 'RZ-VITC-001',
    name: 'GlowDrop Vitamin C Brightening Serum',
    description:
      'Brightening vitamin C serum for dull skin and dark spots. Boosts glow and evens tone; use in the morning. Space it apart from strong exfoliants.',
    priceCents: 18000,
    stock: 20,
    attributes: { skinType: ['all', 'combination', 'normal'], ingredients: 'Vitamin C (Ascorbic Acid), Vitamin E, Ferulic Acid' },
  },
  {
    sku: 'RZ-SPF-001',
    name: 'DayShield Oil-Free Sunscreen SPF 50',
    description:
      'Matte, oil-free broad-spectrum SPF 50 sunscreen for oily and combination skin. No white cast and sits well under makeup — essential for hot, sunny days.',
    priceCents: 15000,
    stock: 28,
    attributes: { skinType: ['oily', 'combination', 'sensitive'], ingredients: 'Zinc Oxide, Niacinamide, Aqua' },
  },
];

(async () => {
  let store = await p.store.findFirst({ where: { slug: 'rozhna-beauty' } });
  if (!store) {
    store = await p.store.create({
      data: { name: 'Rozhna Beauty', slug: 'rozhna-beauty', isActive: true, description: 'In-house beauty picks.' },
    });
  }
  let cat = await p.category.findFirst({ where: { OR: [{ slug: 'skincare' }, { name: 'Skincare' }] } });
  if (!cat) {
    cat = await p.category.create({ data: { name: 'Skincare', slug: 'skincare', isActive: true } });
  }
  for (const s of PRODUCTS) {
    const prod = await p.product.upsert({
      where: { sku: s.sku },
      update: { stock: s.stock, isActive: true },
      create: {
        name: s.name,
        sku: s.sku,
        description: s.description,
        priceCents: s.priceCents,
        currency: 'IQD',
        stock: s.stock,
        imageUrl: `https://picsum.photos/seed/${s.sku}/400/400`,
        isActive: true,
        storeId: store.id,
        categoryId: cat.id,
        attributes: s.attributes,
      },
    });
    console.log(`  ✓ ${prod.name} [${prod.id}] stock=${prod.stock}`);
  }
  const total = await p.product.count({ where: { isActive: true } });
  console.log(`Done. Store="${store.name}" Category="${cat.name}". Active products now: ${total}`);
  await p.$disconnect();
})().catch(async (e) => {
  console.error('SEED ERROR:', e.message);
  await p.$disconnect();
  process.exit(1);
});
