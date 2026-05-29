import { CartStatus, OrderStatus, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const productSeed = [
  { name: 'USB-C Hub 7-in-1', sku: 'HUB-7N1', category: 'Electronics', priceCents: 4999, stock: 80, imageUrl: 'https://picsum.photos/seed/hub/400/300' },
  { name: 'Wireless Mouse', sku: 'WMOUSE-01', category: 'Electronics', priceCents: 2999, stock: 150, imageUrl: 'https://picsum.photos/seed/mouse/400/300' },
  { name: 'Mechanical Keyboard 65%', sku: 'KEYB-65', category: 'Electronics', priceCents: 12999, stock: 40, imageUrl: 'https://picsum.photos/seed/keyboard/400/300' },
  { name: 'Noise-Cancelling Headphones', sku: 'NCH-PRO', category: 'Electronics', priceCents: 24999, stock: 25, imageUrl: 'https://picsum.photos/seed/headphones/400/300' },
  { name: 'Classic Cotton T-Shirt', sku: 'TEE-CLASSIC', category: 'Apparel', priceCents: 1999, stock: 200, imageUrl: 'https://picsum.photos/seed/tee/400/300' },
  { name: 'Denim Jacket', sku: 'JACKET-DENIM', category: 'Apparel', priceCents: 7999, stock: 60, imageUrl: 'https://picsum.photos/seed/jacket/400/300' },
  { name: 'Running Shoes', sku: 'SHOE-RUN', category: 'Apparel', priceCents: 8999, stock: 75, imageUrl: 'https://picsum.photos/seed/shoes/400/300' },
  { name: 'Ceramic Mug Set (4)', sku: 'MUG-SET4', category: 'Home', priceCents: 3499, stock: 90, imageUrl: 'https://picsum.photos/seed/mug/400/300' },
  { name: 'Linen Throw Blanket', sku: 'THROW-LINEN', category: 'Home', priceCents: 5499, stock: 50, imageUrl: 'https://picsum.photos/seed/throw/400/300' },
  { name: 'Bedside Lamp', sku: 'LAMP-BED', category: 'Home', priceCents: 4499, stock: 35, imageUrl: 'https://picsum.photos/seed/lamp/400/300' },
  { name: 'Vitamin C Serum 30ml', sku: 'SERUM-VITC', category: 'Beauty', priceCents: 2499, stock: 120, imageUrl: 'https://picsum.photos/seed/serum/400/300' },
  { name: 'Hydrating Toner 200ml', sku: 'TONER-HYDRA', category: 'Beauty', priceCents: 1899, stock: 100, imageUrl: 'https://picsum.photos/seed/toner/400/300' },
];

const customerSeed = [
  { name: 'Alice Carter',       email: 'alice.carter@example.com',    city: 'New York',    country: 'USA' },
  { name: 'Brian Nguyen',       email: 'brian.nguyen@example.com',    city: 'Seattle',     country: 'USA' },
  { name: 'Chen Wei',           email: 'chen.wei@example.com',        city: 'Toronto',     country: 'Canada' },
  { name: 'Dana Hoffmann',      email: 'dana.hoffmann@example.com',   city: 'Berlin',      country: 'Germany' },
  { name: 'Elena Ricci',        email: 'elena.ricci@example.com',     city: 'Milan',       country: 'Italy' },
  { name: 'Farhan Ahmed',       email: 'farhan.ahmed@example.com',    city: 'London',      country: 'UK' },
  { name: 'Gabriela Souza',     email: 'gabriela.souza@example.com',  city: 'São Paulo',   country: 'Brazil' },
  { name: 'Hiro Tanaka',        email: 'hiro.tanaka@example.com',     city: 'Tokyo',       country: 'Japan' },
  { name: 'Ines Lefevre',       email: 'ines.lefevre@example.com',    city: 'Paris',       country: 'France' },
  { name: 'Jonas Lindqvist',    email: 'jonas.lindqvist@example.com', city: 'Stockholm',   country: 'Sweden' },
  { name: 'Karim Idris',        email: 'karim.idris@example.com',     city: 'Cairo',       country: 'Egypt' },
  { name: 'Lina Park',          email: 'lina.park@example.com',       city: 'Seoul',       country: 'South Korea' },
  { name: 'Marco Diaz',         email: 'marco.diaz@example.com',      city: 'Madrid',      country: 'Spain' },
  { name: 'Nia Williams',       email: 'nia.williams@example.com',    city: 'Austin',      country: 'USA', isActive: false },
  { name: 'Omar Haddad',        email: 'omar.haddad@example.com',     city: 'Dubai',       country: 'UAE' },
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
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
}

async function seedProducts() {
  for (const p of productSeed) {
    await prisma.product.create({ data: p });
  }
  const products = await prisma.product.findMany();
  console.log(`✓ Products: ${products.length}`);
  return products;
}

async function seedCustomers() {
  for (const c of customerSeed) {
    await prisma.customer.create({ data: c });
  }
  const customers = await prisma.customer.findMany();
  console.log(`✓ Customers: ${customers.length}`);
  return customers;
}

async function seedCarts(
  customers: { id: string }[],
  products: { id: string; priceCents: number }[],
) {
  for (let i = 0; i < CART_STATUSES.length; i++) {
    const customer = customers[i % customers.length];
    const status = CART_STATUSES[i];
    const itemCount = randomInt(1, 4);
    const picked = new Set<string>();
    const items = [];
    while (items.length < itemCount && items.length < products.length) {
      const product = products[randomInt(0, products.length - 1)];
      if (picked.has(product.id)) continue;
      picked.add(product.id);
      items.push({
        productId: product.id,
        quantity: randomInt(1, 3),
        priceCents: product.priceCents,
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
  customers: { id: string }[],
  products: { id: string; name: string; sku: string; priceCents: number; currency: string }[],
) {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 30; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const status = pickWeighted(ORDER_STATUSES).status;
    const placedAt = new Date(now - randomInt(0, 30) * DAY_MS - randomInt(0, DAY_MS));

    const itemCount = randomInt(1, 4);
    const picked = new Set<string>();
    const items = [];
    while (items.length < itemCount && items.length < products.length) {
      const product = products[randomInt(0, products.length - 1)];
      if (picked.has(product.id)) continue;
      picked.add(product.id);
      items.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: randomInt(1, 3),
        priceCents: product.priceCents,
      });
    }

    const subtotalCents = items.reduce((s, it) => s + it.priceCents * it.quantity, 0);
    const taxCents = Math.round(subtotalCents * 0.08);
    const shippingCents = subtotalCents >= 10000 ? 0 : 599;
    const totalCents = subtotalCents + taxCents + shippingCents;

    await prisma.order.create({
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
        items: { create: items },
      },
    });
  }
  console.log(`✓ Orders: 30`);
}

async function main() {
  console.log('Seeding…');
  await seedAdmin();
  await clearShopData();
  const products = await seedProducts();
  const customers = await seedCustomers();
  await seedCarts(customers, products);
  await seedOrders(customers, products);
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
