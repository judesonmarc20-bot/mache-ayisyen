// =========================================================================
// seed.js — Ranpli baz done a ak done demo
// =========================================================================
// Rele l ak: npm run seed
// Kreye: 1 admin, 2 vandè (ak magazen yo), kategori, pwodwi, zòn livrezon,
// koupon, ak kèk evalyasyon. Mache ak SQLite (lokal) oswa Postgres (pwodiksyon).
// =========================================================================
require('dotenv').config();
const { v4: uuid } = require('uuid');
const db = require('./db');
const User = require('./models/User');
const Store = require('./models/Store');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const ShippingZone = require('./models/ShippingZone');

async function seed() {
  await db.init();

  console.log('🌱 Ap netwaye ansyen done...');
  // Nou efase nan lòd ki respekte foreign keys yo.
  for (const table of [
    'messages',
    'conversations',
    'reviews',
    'wishlist_items',
    'coupons',
    'shipping_zones',
    'payments',
    'order_items',
    'orders',
    'cart_items',
    'products',
    'categories',
    'stores',
    'users',
  ]) {
    await db.run(`DELETE FROM ${table}`);
  }

  console.log('🌱 Ap kreye itilizatè yo...');
  const admin = await User.create({
    email: 'admin@marketplace.ht',
    password: 'admin123',
    name: 'Admin Prensipal',
    role: 'ADMIN',
  });

  const vendor1 = await User.create({
    email: 'vandeur1@marketplace.ht',
    password: 'vandeur123',
    name: 'Jean Pierre',
    role: 'VENDOR',
  });
  const store1 = await Store.create({
    name: 'Boutik Jean',
    description: 'Rad ak akseswa fèt an Ayiti',
    ownerId: vendor1.id,
  });

  const vendor2 = await User.create({
    email: 'vandeur2@marketplace.ht',
    password: 'vandeur123',
    name: 'Marie Louise',
    role: 'VENDOR',
  });
  const store2 = await Store.create({
    name: 'Atelye Marie',
    description: 'Bijou ak atizana fèt alamen',
    ownerId: vendor2.id,
  });

  const customer = await User.create({
    email: 'kliyan@marketplace.ht',
    password: 'kliyan123',
    name: 'Pierre Client',
    role: 'CUSTOMER',
  });

  console.log('🌱 Ap kreye kategori yo...');
  const catVet = await Category.create({ name: 'Rad' });
  const catBijou = await Category.create({ name: 'Bijou' });
  const catMaison = await Category.create({ name: 'Kay & Dekorasyon' });

  console.log('🌱 Ap kreye pwodwi yo...');
  const prod1 = await Product.create({
    name: 'Chemiz Blan Klasik',
    description: 'Yon chemiz blan 100% koton, byen kout, pou nenpòt okazyon.',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    stock: 25,
    storeId: store1.id,
    categoryId: catVet.id,
  });
  await Product.create({
    name: 'Chapo Pay Tradisyonèl',
    description: 'Chapo pay fèt alamen, pafè pou solèy Karayib la.',
    price: 850,
    imageUrl: 'https://images.unsplash.com/photo-1533055640609-24b498dfd74c?w=600',
    stock: 15,
    storeId: store1.id,
    categoryId: catVet.id,
  });
  await Product.create({
    name: 'Kolye Kokiyaj',
    description: 'Kolye fèt ak kokiyaj natirèl, yon sèl pyès pou chak kliyan.',
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
    stock: 10,
    storeId: store2.id,
    categoryId: catBijou.id,
  });
  await Product.create({
    name: 'Braslè Pèl Aran Ble',
    description: 'Yon braslè elegant, fèt alamen ak pyè natirèl.',
    price: 950,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
    stock: 8,
    storeId: store2.id,
    categoryId: catBijou.id,
  });
  const prod5 = await Product.create({
    name: 'Vaz Seramik Penti Alamen',
    description: 'Yon vaz dekoratif ki penti alamen pa atizan lokal.',
    price: 1500,
    // Pa mete foto moun kòm imaj pwodwi a. Yo ka ajoute yon foto vaz reyèl pita.
    imageUrl: null,
    stock: 5,
    storeId: store2.id,
    categoryId: catMaison.id,
  });

  console.log('🌱 Ap kreye zòn livrezon yo...');
  await ShippingZone.create({ name: 'Pòtoprens (zòn metwopolitèn)', fee: 150 });
  await ShippingZone.create({ name: 'Okap / Nò', fee: 350 });
  await ShippingZone.create({ name: 'Gonayiv / Latibonit', fee: 300 });
  await ShippingZone.create({ name: 'Okay / Sid', fee: 400 });
  await ShippingZone.create({ name: 'Lòt vil / pwovens', fee: 500 });

  console.log('🌱 Ap kreye koupon egzanp yo...');
  await Coupon.create({ code: 'SOLDE10', type: 'PERCENT', value: 10, minOrder: 0 });
  await Coupon.create({ code: 'BYENVENI', type: 'FIXED', value: 200, minOrder: 1000 });

  console.log('🌱 Ap kreye kèk evalyasyon demo...');
  // Pou demo nou ensere review yo dirèkteman (nan vrè app la, sèlman moun ki
  // achte ka bay review).
  await db.run(
    `INSERT INTO reviews (id, productId, userId, rating, comment) VALUES (?, ?, ?, ?, ?)`,
    [uuid(), prod1.id, customer.id, 5, 'Bon jan chemiz, koton an bon kalite. Mwen renmen l!']
  );
  await db.run(
    `INSERT INTO reviews (id, productId, userId, rating, comment) VALUES (?, ?, ?, ?, ?)`,
    [uuid(), prod5.id, customer.id, 4, 'Vaz la bèl anpil, men li te rive yon ti jan an reta.']
  );

  console.log('✅ Baz done a ranpli ak siksè!');
  console.log('');
  console.log('Kont demo yo:');
  console.log('  ADMIN   -> admin@marketplace.ht / admin123');
  console.log('  VANDÈ 1 -> vandeur1@marketplace.ht / vandeur123 (Boutik Jean)');
  console.log('  VANDÈ 2 -> vandeur2@marketplace.ht / vandeur123 (Atelye Marie)');
  console.log('  KLIYAN  -> kliyan@marketplace.ht / kliyan123');
}

// Ranpli baz done a SÈLMAN si li vid (itil sou premye deplwaman an, kote
// nou pa gen aksè a yon tèminal pou kouri "npm run seed" manyèlman).
async function seedIfEmpty() {
  await db.init();
  const row = await db.get(`SELECT CAST(COUNT(*) AS INTEGER) as n FROM users`);
  if (row.n > 0) {
    console.log('ℹ️  Baz done a gen done deja — nou pa re-seed.');
    return;
  }
  await seed();
}

module.exports = { seed, seedIfEmpty };

// Si nou rele fichye sa a dirèkteman (npm run seed), egzekite seed la.
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Erè pandan seed la:', err);
      process.exit(1);
    });
}
