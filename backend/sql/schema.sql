-- =========================================================================
-- SCHEMA BAZ DONE POU MARKETPLACE LA (SQLite)
-- =========================================================================
-- Chak "CREATE TABLE" anba a se yon "tab" (tablo) nan baz done a.
-- SQLite estoke tout bagay nan YON SÈL fichye (dev.db) -- fasil pou devlope
-- ak demontre san ou pa bezwen enstale yon sèvè baz done apa.
--
-- POU PWODIKSYON / VANN KOM SAAS: ranplase SQLite ak PostgreSQL fasil,
-- paske SQL la anba a se estanda (ANSI SQL) -- gade README.md pou plis detay.
-- =========================================================================

-- Itilizatè yo: kapab CUSTOMER (achtè), VENDOR (machann/vann pwodwi),
-- oswa ADMIN (moun ki jere tout platfòm lan).
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,            -- hash bcrypt, JAMAIS tèks klè
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'CUSTOMER', -- ADMIN | VENDOR | CUSTOMER
  createdAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chak "Store" se yon ti magazen ki apatyen a yon itilizatè VENDOR.
-- Se konsa platfòm lan vin "multi-vendor": plizyè moun ka gen pwòp
-- magazen pa yo anndan menm sit la (tankou Etsy oswa yon mini-Amazon).
CREATE TABLE IF NOT EXISTS stores (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,     -- pou URL: /store/mon-magazen
  description TEXT,
  logoUrl     TEXT,
  active      INTEGER NOT NULL DEFAULT 1, -- 1 = aktif, 0 = dezaktive
  ownerId     TEXT UNIQUE NOT NULL,     -- FK -> users.id (yon vandè = yon magazen)
  createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id   TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT NOT NULL,
  price       REAL NOT NULL,
  imageUrl    TEXT,
  stock       INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  storeId     TEXT NOT NULL,
  categoryId  TEXT,
  createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  UNIQUE (storeId, slug)
);

-- Panye a: yon liy pou chak pwodwi yon itilizatè mete nan panye li.
CREATE TABLE IF NOT EXISTS cart_items (
  id        TEXT PRIMARY KEY,
  quantity  INTEGER NOT NULL DEFAULT 1,
  userId    TEXT NOT NULL,
  productId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE (userId, productId)
);

CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|PAID|SHIPPED|DELIVERED|CANCELLED
  subtotal      REAL NOT NULL DEFAULT 0,   -- total pwodwi anvan rabè ak livrezon
  discount      REAL NOT NULL DEFAULT 0,   -- montan rabè koupon an
  couponCode    TEXT,                       -- kòd koupon ki te aplike (si genyen)
  shippingFee   REAL NOT NULL DEFAULT 0,   -- frè livrezon
  shippingZone  TEXT,                       -- non zòn livrezon an
  paymentMethod TEXT NOT NULL DEFAULT 'MONCASH', -- MONCASH | CARD
  total         REAL NOT NULL,              -- subtotal - discount + shippingFee
  userId        TEXT NOT NULL,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Nou konsève yon "snapshot" (non pwodwi, ID magazen) sou chak liy kòmand
-- pou si yon pwodwi chanje non oswa disparèt apre, istwa kòmand lan rete kòrèk.
CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY,
  quantity    INTEGER NOT NULL,
  unitPrice   REAL NOT NULL,
  orderId     TEXT NOT NULL,
  productId   TEXT NOT NULL,
  storeId     TEXT NOT NULL,
  productName TEXT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Chak tantativ peman MonCash pou yon kòmand. Nou konsève yon "moncashOrderId"
-- (yon nimewo senp nou envante) apa de ID entèn kòmand lan (yon UUID), paske
-- API MonCash lan mande yon "orderId" pou chak tantativ -- konsa nou ka
-- re-eseye yon peman (nouvo tantativ) san nou pa mele ak ansyen yo.
CREATE TABLE IF NOT EXISTS payments (
  id             TEXT PRIMARY KEY,
  orderId        TEXT NOT NULL,
  moncashOrderId TEXT UNIQUE NOT NULL,
  transactionId  TEXT,
  payerPhone     TEXT,
  status         TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED | FAILED
  createdAt      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Evalyasyon (reviews): yon kliyan ki achte yon pwodwi ka ba li 1-5 zetwal.
-- Yon sèl review pa itilizatè pa pwodwi (UNIQUE).
CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  productId  TEXT NOT NULL,
  userId     TEXT NOT NULL,
  rating     INTEGER NOT NULL,   -- 1 a 5
  comment    TEXT,
  createdAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE (productId, userId)
);

-- Wishlist (pwodwi favori) pou chak itilizatè.
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         TEXT PRIMARY KEY,
  userId     TEXT NOT NULL,
  productId  TEXT NOT NULL,
  createdAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE (userId, productId)
);

-- Koupon rabè. storeId NULL = koupon platfòm (admin); si li gen yon storeId,
-- se yon koupon vandè (aplike sèlman sou pwodwi magazen sa a).
CREATE TABLE IF NOT EXISTS coupons (
  id         TEXT PRIMARY KEY,
  code       TEXT UNIQUE NOT NULL,
  type       TEXT NOT NULL DEFAULT 'PERCENT', -- PERCENT | FIXED
  value      REAL NOT NULL,                    -- pousantaj (0-100) oswa montan fiks (goud)
  minOrder   REAL NOT NULL DEFAULT 0,          -- montan minimòm kòmand pou koupon valab
  maxUses    INTEGER,                          -- limit itilizasyon (NULL = san limit)
  usedCount  INTEGER NOT NULL DEFAULT 0,
  active     INTEGER NOT NULL DEFAULT 1,
  storeId    TEXT,                             -- NULL = platfòm; sinon vandè espesifik
  expiresAt  TEXT,                             -- dat ekspirasyon (NULL = pa ekspire)
  createdAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id)
);

-- Zòn livrezon ak frè yo (jere pa admin).
CREATE TABLE IF NOT EXISTS shipping_zones (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  fee     REAL NOT NULL DEFAULT 0,
  active  INTEGER NOT NULL DEFAULT 1
);

-- Konvèsasyon chat: youn ant yon kliyan ak yon magazen (vandè).
CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY,
  customerId  TEXT NOT NULL,
  storeId     TEXT NOT NULL,
  createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (storeId) REFERENCES stores(id),
  UNIQUE (customerId, storeId)
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversationId  TEXT NOT NULL,
  senderId        TEXT NOT NULL,
  body            TEXT NOT NULL,
  readAt          TEXT,
  createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id),
  FOREIGN KEY (senderId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_products_store ON products(storeId);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_orderitems_order ON order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_cartitems_user ON cart_items(userId);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(orderId);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(productId);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(userId);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_conv_customer ON conversations(customerId);
CREATE INDEX IF NOT EXISTS idx_conv_store ON conversations(storeId);
