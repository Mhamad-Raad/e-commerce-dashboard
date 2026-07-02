import {
  CartStatus,
  City,
  Gender,
  Governorate,
  OrderStatus,
  PaymentMethod,
  PrismaClient,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';

const categorySeed = [
  { name: 'Electronics', imageUrl: 'https://picsum.photos/seed/cat-electronics/400/300' },
  { name: 'Apparel',     imageUrl: 'https://picsum.photos/seed/cat-apparel/400/300' },
  { name: 'Home',        imageUrl: 'https://picsum.photos/seed/cat-home/400/300' },
  { name: 'Beauty',      imageUrl: 'https://picsum.photos/seed/cat-beauty/400/300' },
];

// Each store specialises in one category (its products map by that category name).
const storeSeed = [
  { name: 'Baghdad Tech', category: 'Electronics', city: 'Baghdad', country: 'Iraq', description: 'Gadgets, accessories and everyday electronics.', logoUrl: 'https://picsum.photos/seed/store-tech/200/200',   bannerUrl: 'https://picsum.photos/seed/store-tech-b/1200/300' },
  { name: 'Mosul Threads', category: 'Apparel',    city: 'Mosul',   country: 'Iraq', description: 'Everyday apparel and footwear.',            logoUrl: 'https://picsum.photos/seed/store-threads/200/200', bannerUrl: 'https://picsum.photos/seed/store-threads-b/1200/300' },
  { name: 'Basra Home',    category: 'Home',        city: 'Basra',   country: 'Iraq', description: 'Homeware and cosy living essentials.',       logoUrl: 'https://picsum.photos/seed/store-home/200/200',   bannerUrl: 'https://picsum.photos/seed/store-home-b/1200/300' },
  { name: 'Erbil Glow',    category: 'Beauty',      city: 'Erbil',   country: 'Iraq', description: 'Skincare and beauty, curated.',              logoUrl: 'https://picsum.photos/seed/store-glow/200/200',   bannerUrl: 'https://picsum.photos/seed/store-glow-b/1200/300' },
];

const bannerSeed = [
  { title: 'New season, new tech',  subtitle: 'Up to 30% off accessories', imageUrl: 'https://picsum.photos/seed/banner-1/1200/400', linkUrl: '/category/electronics', sortOrder: 0 },
  { title: 'Refresh your wardrobe', subtitle: 'Apparel arrivals are here',  imageUrl: 'https://picsum.photos/seed/banner-2/1200/400', linkUrl: '/category/apparel',     sortOrder: 1 },
  { title: 'Glow up',               subtitle: 'Beauty picks of the week',   imageUrl: 'https://picsum.photos/seed/banner-3/1200/400', linkUrl: '/category/beauty',      sortOrder: 2 },
];

// Prices are whole Iraqi dinars (IQD has no minor unit, so the integer field
// holds dinars directly — see frontend lib/format.ts currency exponents).
const productSeed = [
  { name: 'USB-C Hub 7-in-1', sku: 'HUB-7N1', category: 'Electronics', priceCents: 65000, stock: 80, imageUrl: 'https://picsum.photos/seed/hub/400/300' },
  { name: 'Wireless Mouse', sku: 'WMOUSE-01', category: 'Electronics', priceCents: 39000, salePriceCents: 29000, stock: 150, imageUrl: 'https://picsum.photos/seed/mouse/400/300' },
  { name: 'Mechanical Keyboard 65%', sku: 'KEYB-65', category: 'Electronics', priceCents: 170000, stock: 40, imageUrl: 'https://picsum.photos/seed/keyboard/400/300' },
  { name: 'Noise-Cancelling Headphones', sku: 'NCH-PRO', category: 'Electronics', priceCents: 325000, stock: 25, imageUrl: 'https://picsum.photos/seed/headphones/400/300' },
  { name: 'Classic Cotton T-Shirt', sku: 'TEE-CLASSIC', category: 'Apparel', priceCents: 25000, stock: 200, imageUrl: 'https://picsum.photos/seed/tee/400/300' },
  { name: 'Denim Jacket', sku: 'JACKET-DENIM', category: 'Apparel', priceCents: 105000, stock: 60, imageUrl: 'https://picsum.photos/seed/jacket/400/300' },
  { name: 'Running Shoes', sku: 'SHOE-RUN', category: 'Apparel', priceCents: 118000, stock: 75, imageUrl: 'https://picsum.photos/seed/shoes/400/300' },
  { name: 'Ceramic Mug Set (4)', sku: 'MUG-SET4', category: 'Home', priceCents: 45000, stock: 90, imageUrl: 'https://picsum.photos/seed/mug/400/300' },
  { name: 'Linen Throw Blanket', sku: 'THROW-LINEN', category: 'Home', priceCents: 72000, stock: 50, imageUrl: 'https://picsum.photos/seed/throw/400/300' },
  { name: 'Bedside Lamp', sku: 'LAMP-BED', category: 'Home', priceCents: 59000, stock: 35, imageUrl: 'https://picsum.photos/seed/lamp/400/300' },
  { name: 'Vitamin C Serum', sku: 'SERUM-VITC', category: 'Beauty', priceCents: 32000, stock: 120, imageUrl: 'https://picsum.photos/seed/serum/400/300' },
  { name: 'Hydrating Toner', sku: 'TONER-HYDRA', category: 'Beauty', priceCents: 25000, salePriceCents: 19000, stock: 100, imageUrl: 'https://picsum.photos/seed/toner/400/300' },
];

const couponSeed = [
  { code: 'WELCOME10', type: 'PERCENT' as const, value: 10, minSubtotalCents: 0 },
  { code: 'SAVE5000', type: 'FIXED' as const, value: 5000, minSubtotalCents: 50000 },
  { code: 'VIP20', type: 'PERCENT' as const, value: 20, minSubtotalCents: 100000, maxRedemptions: 50 },
];

// Optional variants keyed by product SKU. Products not listed here are "simple"
// (sold at their own price/stock with no variant). Each variant carries its own
// SKU, price (IQD) and stock.
const variantSeed: Record<string, { name: string; sku: string; priceCents: number; stock: number }[]> = {
  'TEE-CLASSIC': [
    { name: 'Black / S', sku: 'TEE-CLASSIC-BK-S', priceCents: 25000, stock: 50 },
    { name: 'Black / M', sku: 'TEE-CLASSIC-BK-M', priceCents: 25000, stock: 60 },
    { name: 'Black / L', sku: 'TEE-CLASSIC-BK-L', priceCents: 25000, stock: 40 },
    { name: 'White / M', sku: 'TEE-CLASSIC-WT-M', priceCents: 25000, stock: 30 },
    { name: 'White / L', sku: 'TEE-CLASSIC-WT-L', priceCents: 25000, stock: 20 },
  ],
  'JACKET-DENIM': [
    { name: 'S', sku: 'JACKET-DENIM-S', priceCents: 105000, stock: 15 },
    { name: 'M', sku: 'JACKET-DENIM-M', priceCents: 105000, stock: 25 },
    { name: 'L', sku: 'JACKET-DENIM-L', priceCents: 110000, stock: 20 },
  ],
  'SHOE-RUN': [
    { name: 'EU 40', sku: 'SHOE-RUN-40', priceCents: 118000, stock: 20 },
    { name: 'EU 42', sku: 'SHOE-RUN-42', priceCents: 118000, stock: 30 },
    { name: 'EU 44', sku: 'SHOE-RUN-44', priceCents: 118000, stock: 25 },
  ],
  'SERUM-VITC': [
    { name: '30ml', sku: 'SERUM-VITC-30', priceCents: 32000, stock: 70 },
    { name: '50ml', sku: 'SERUM-VITC-50', priceCents: 48000, stock: 50 },
  ],
};

const customerSeed = [
  { name: 'Alice Carter',       email: 'alice.carter@example.com',    city: 'New York',    country: 'USA',          gender: Gender.FEMALE },
  { name: 'Brian Nguyen',       email: 'brian.nguyen@example.com',    city: 'Seattle',     country: 'USA',          gender: Gender.MALE },
  { name: 'Chen Wei',           email: 'chen.wei@example.com',        city: 'Toronto',     country: 'Canada',       gender: Gender.MALE },
  { name: 'Dana Hoffmann',      email: 'dana.hoffmann@example.com',   city: 'Berlin',      country: 'Germany',      gender: Gender.FEMALE },
  { name: 'Elena Ricci',        email: 'elena.ricci@example.com',     city: 'Milan',       country: 'Italy',        gender: Gender.FEMALE },
  { name: 'Farhan Ahmed',       email: 'farhan.ahmed@example.com',    city: 'London',      country: 'UK',           gender: Gender.MALE },
  { name: 'Gabriela Souza',     email: 'gabriela.souza@example.com',  city: 'São Paulo',   country: 'Brazil',       gender: Gender.FEMALE },
  { name: 'Hiro Tanaka',        email: 'hiro.tanaka@example.com',     city: 'Tokyo',       country: 'Japan',        gender: Gender.MALE },
  { name: 'Ines Lefevre',       email: 'ines.lefevre@example.com',    city: 'Paris',       country: 'France',       gender: Gender.FEMALE },
  { name: 'Jonas Lindqvist',    email: 'jonas.lindqvist@example.com', city: 'Stockholm',   country: 'Sweden',       gender: Gender.MALE },
  { name: 'Karim Idris',        email: 'karim.idris@example.com',     city: 'Cairo',       country: 'Egypt',        gender: Gender.MALE },
  { name: 'Lina Park',          email: 'lina.park@example.com',       city: 'Seoul',       country: 'South Korea',  gender: Gender.FEMALE },
  { name: 'Marco Diaz',         email: 'marco.diaz@example.com',      city: 'Madrid',      country: 'Spain',        gender: Gender.MALE },
  { name: 'Nia Williams',       email: 'nia.williams@example.com',    city: 'Austin',      country: 'USA',          gender: Gender.FEMALE, isActive: false },
  { name: 'Omar Haddad',        email: 'omar.haddad@example.com',     city: 'Dubai',       country: 'UAE',          gender: Gender.MALE },
];

// One address per customer for the first few customers (max 3 enforced in app).
const addressSeed: {
  label: string;
  governorate: Governorate;
  city: City;
  district?: string;
  street?: string;
  phone?: string;
}[] = [
  { label: 'Home', governorate: 'BAGHDAD', city: 'BAGHDAD', district: 'Karrada', street: 'Street 14', phone: '0770 123 4567' },
  { label: 'Home', governorate: 'BASRA', city: 'BASRA', district: 'Al-Ashar', street: 'Corniche Rd', phone: '0771 234 5678' },
  { label: 'Work', governorate: 'ERBIL', city: 'ERBIL', district: 'Ankawa', street: '100m Road', phone: '0750 345 6789' },
  { label: 'Home', governorate: 'NINEVEH', city: 'MOSUL', district: 'Al-Majmoua', phone: '0772 456 7890' },
  { label: 'Home', governorate: 'NAJAF', city: 'NAJAF', district: 'Old City', phone: '0780 567 8901' },
  { label: 'Home', governorate: 'KARBALA', city: 'KARBALA', phone: '0781 678 9012' },
  { label: 'Work', governorate: 'SULAYMANIYAH', city: 'SULAYMANIYAH', district: 'Salim Street', phone: '0770 789 0123' },
  { label: 'Home', governorate: 'BABYLON', city: 'HILLAH', phone: '0782 890 1234' },
];

const ORDER_STATUSES: { status: OrderStatus; weight: number }[] = [
  { status: 'DELIVERED', weight: 8 },
  { status: 'PAID',      weight: 4 },
  { status: 'SHIPPED',   weight: 3 },
  { status: 'PENDING',   weight: 2 },
  { status: 'CANCELLED', weight: 1 },
  { status: 'REFUNDED',  weight: 1 },
];

const CART_STATUSES: CartStatus[] = ['OPEN', 'OPEN', 'OPEN', 'CHECKED_OUT', 'ABANDONED', 'ABANDONED'];

const pickWeighted = <T extends { weight: number }>(items: T[]): T => {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'Admin', role: Role.ADMIN },
  });
  console.log(`✓ Admin: ${email} / ${password}`);
}

async function clearShopData() {
  await prisma.featuredProduct.deleteMany();
  await prisma.featuredCategory.deleteMany();
  await prisma.featuredStore.deleteMany();
  await prisma.heroBanner.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
}

async function seedCategories() {
  for (const c of categorySeed) {
    await prisma.category.create({ data: { ...c, slug: slugify(c.name) } });
  }
  const categories = await prisma.category.findMany();
  console.log(`✓ Categories: ${categories.length}`);
  return new Map(categories.map((c) => [c.name, c.id]));
}

async function seedStores() {
  for (const s of storeSeed) {
    const { category, ...data } = s;
    void category;
    await prisma.store.create({ data: { ...data, slug: slugify(s.name) } });
  }
  const stores = await prisma.store.findMany();
  console.log(`✓ Stores: ${stores.length}`);
  // category name -> store id (each store owns one category)
  const byCategory = new Map<string, string>();
  for (const s of storeSeed) {
    const store = stores.find((st) => st.name === s.name);
    if (store) byCategory.set(s.category, store.id);
  }
  return byCategory;
}

async function seedProducts(
  categoryByName: Map<string, string>,
  storeByCategory: Map<string, string>,
) {
  const fallbackStoreId = storeByCategory.values().next().value as string;
  let variantCount = 0;
  for (const p of productSeed) {
    const { category, ...rest } = p;
    const product = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoryByName.get(category) ?? null,
        storeId: storeByCategory.get(category) ?? fallbackStoreId,
      },
    });
    const variants = variantSeed[p.sku];
    if (variants) {
      await prisma.productVariant.createMany({
        data: variants.map((v, i) => ({ ...v, productId: product.id, sortOrder: i })),
      });
      variantCount += variants.length;
    }
  }
  const products = await prisma.product.findMany({ include: { variants: true } });
  console.log(`✓ Products: ${products.length} (+${variantCount} variants)`);
  return products;
}

type SeedProduct = {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  currency: string;
  variants: { id: string; name: string; priceCents: number }[];
};

// Pick a purchasable line: if the product has variants, choose one at random and
// snapshot its name + price; otherwise sell the simple product itself.
const pickLine = (product: SeedProduct) => {
  if (product.variants.length) {
    const v = product.variants[randomInt(0, product.variants.length - 1)];
    return { variantId: v.id, variantName: v.name, priceCents: v.priceCents, key: v.id };
  }
  return { variantId: null, variantName: null, priceCents: product.priceCents, key: product.id };
};

async function seedHomepage(
  products: { id: string }[],
  categoryByName: Map<string, string>,
  storeByCategory: Map<string, string>,
) {
  for (const b of bannerSeed) {
    await prisma.heroBanner.create({ data: b });
  }
  await prisma.featuredProduct.createMany({
    data: products.slice(0, 4).map((p, i) => ({ productId: p.id, sortOrder: i })),
  });
  await prisma.featuredCategory.createMany({
    data: [...categoryByName.values()].slice(0, 3).map((categoryId, i) => ({ categoryId, sortOrder: i })),
  });
  await prisma.featuredStore.createMany({
    data: [...storeByCategory.values()].slice(0, 3).map((storeId, i) => ({ storeId, sortOrder: i })),
  });
  console.log(`✓ Homepage: ${bannerSeed.length} banners + featured sets`);
}

async function seedCustomers() {
  for (const c of customerSeed) {
    await prisma.customer.create({ data: c });
  }
  const customers = await prisma.customer.findMany();
  console.log(`✓ Customers: ${customers.length}`);
  return customers;
}

type DefaultAddress = {
  governorate: Governorate;
  city: City;
  district: string | null;
  street: string | null;
  nearestLandmark: string | null;
  phone: string | null;
};

async function seedAddresses(customers: { id: string }[]) {
  const byCustomer = new Map<string, DefaultAddress>();
  const n = Math.min(addressSeed.length, customers.length);
  for (let i = 0; i < n; i++) {
    const created = await prisma.address.create({
      data: { ...addressSeed[i], customerId: customers[i].id, isDefault: true },
    });
    byCustomer.set(customers[i].id, created);
  }
  console.log(`✓ Addresses: ${n}`);
  return byCustomer;
}

async function seedCarts(customers: { id: string }[], products: SeedProduct[]) {
  for (let i = 0; i < CART_STATUSES.length; i++) {
    const customer = customers[i % customers.length];
    const status = CART_STATUSES[i];
    const itemCount = randomInt(1, 4);
    const picked = new Set<string>();
    const items = [];
    while (items.length < itemCount && items.length < products.length) {
      const product = products[randomInt(0, products.length - 1)];
      const line = pickLine(product);
      if (picked.has(line.key)) continue;
      picked.add(line.key);
      items.push({
        productId: product.id,
        variantId: line.variantId,
        variantName: line.variantName,
        quantity: randomInt(1, 3),
        priceCents: line.priceCents,
      });
    }
    await prisma.cart.create({
      data: { customerId: customer.id, status, items: { create: items } },
    });
  }
  const carts = await prisma.cart.count();
  console.log(`✓ Carts: ${carts}`);
}

async function seedOrders(
  customers: { id: string; name: string }[],
  products: SeedProduct[],
  defaultAddressByCustomer: Map<string, DefaultAddress>,
) {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  let paymentCount = 0;

  for (let i = 0; i < 30; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const status = pickWeighted(ORDER_STATUSES).status;
    const placedAt = new Date(now - randomInt(0, 30) * DAY_MS - randomInt(0, DAY_MS));

    const itemCount = randomInt(1, 4);
    const picked = new Set<string>();
    const items = [];
    while (items.length < itemCount && items.length < products.length) {
      const product = products[randomInt(0, products.length - 1)];
      const line = pickLine(product);
      if (picked.has(line.key)) continue;
      picked.add(line.key);
      items.push({
        productId: product.id,
        variantId: line.variantId,
        variantName: line.variantName,
        name: product.name,
        sku: product.sku,
        quantity: randomInt(1, 3),
        priceCents: line.priceCents,
      });
    }

    const subtotalCents = items.reduce((s, it) => s + it.priceCents * it.quantity, 0);
    const taxCents = Math.round(subtotalCents * 0.08);
    const shippingCents = subtotalCents >= 100000 ? 0 : 5000;
    const totalCents = subtotalCents + taxCents + shippingCents;

    const addr = defaultAddressByCustomer.get(customer.id);
    const shipping = addr
      ? {
          shipName: customer.name,
          shipPhone: addr.phone,
          shipGovernorate: addr.governorate,
          shipCity: addr.city,
          shipDistrict: addr.district,
          shipStreet: addr.street,
          shipLandmark: addr.nearestLandmark,
        }
      : {};

    const order = await prisma.order.create({
      data: {
        number: generateOrderNumber(),
        customerId: customer.id,
        status,
        placedAt,
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        currency: products[0].currency,
        ...shipping,
        items: { create: items },
      },
    });

    // Record a payment (COD is the norm in Iraq) consistent with the status.
    if (status !== 'CANCELLED') {
      const paid = status === 'PAID' || status === 'SHIPPED' || status === 'DELIVERED';
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.COD,
          amountCents: totalCents,
          status: status === 'REFUNDED' ? 'REFUNDED' : paid ? 'PAID' : 'PENDING',
          paidAt: paid || status === 'REFUNDED' ? placedAt : null,
        },
      });
      paymentCount++;
    }
  }
  console.log(`✓ Orders: 30 (+${paymentCount} payments)`);
}

const reviewComments = [
  'Great quality, exactly as described!',
  'Fast delivery and well packaged.',
  'Good value for the money.',
  'Works perfectly, would buy again.',
  'Decent product, packaging could be better.',
  'Absolutely love it!',
  'Met my expectations.',
  'Solid choice, recommended.',
];

async function seedReviews(
  products: { id: string }[],
  customers: { id: string }[],
) {
  let count = 0;
  let approved = 0;
  for (let p = 0; p < Math.min(8, products.length); p++) {
    const product = products[p];
    const n = randomInt(2, 4);
    for (let i = 0; i < n && i < customers.length; i++) {
      const customer = customers[(p + i) % customers.length];
      const rating = randomInt(3, 5);
      const isApproved = Math.random() < 0.75;
      await prisma.review.create({
        data: {
          productId: product.id,
          customerId: customer.id,
          rating,
          comment: reviewComments[randomInt(0, reviewComments.length - 1)],
          isApproved,
        },
      });
      count++;
      if (isApproved) approved++;
    }
    const agg = await prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: product.id },
      data: {
        ratingAvg: agg._avg.rating ? Math.round(agg._avg.rating * 100) / 100 : 0,
        ratingCount: agg._count,
      },
    });
  }
  console.log(`✓ Reviews: ${count} (${approved} approved)`);
}

async function seedCoupons() {
  for (const c of couponSeed) {
    await prisma.coupon.create({ data: c });
  }
  console.log(`✓ Coupons: ${couponSeed.length}`);
}

async function main() {
  console.log('Seeding…');
  await seedAdmin();
  await clearShopData();
  const categoryByName = await seedCategories();
  const storeByCategory = await seedStores();
  const products = await seedProducts(categoryByName, storeByCategory);
  const customers = await seedCustomers();
  const defaultAddressByCustomer = await seedAddresses(customers);
  await seedCoupons();
  await seedReviews(products, customers);
  await seedCarts(customers, products);
  await seedOrders(customers, products, defaultAddressByCustomer);
  await seedHomepage(products, categoryByName, storeByCategory);
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
