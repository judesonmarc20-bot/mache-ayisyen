// =========================================================================
// db.js — Kouch baz done "dual": SQLite (lokal) OSWA PostgreSQL (pwodiksyon)
// =========================================================================
// Nou bay yon SÈL API ki mache pou toude:
//    await db.query(sql, params)  -> lis ranje (array)
//    await db.get(sql, params)    -> yon sèl ranje (oswa undefined)
//    await db.run(sql, params)    -> { changes }
//    await db.tx(async (t) => {...}) -> transaksyon (BEGIN/COMMIT/ROLLBACK)
//
// Ki baz done? Nou gade varyab DATABASE_URL:
//   - Si li kòmanse ak "postgres://" oswa "postgresql://" -> PostgreSQL (pwodiksyon)
//   - Sinon (oswa vid) -> SQLite lokal (fichye dev.db)
//
// Konsa, sou òdinatè ou, ou pa bezwen enstale anyen (SQLite deja anndan
// Node.js). Sou sèvè a (Render/Neon), nou mete DATABASE_URL Postgres la epi
// menm kòd la sèvi ak Postgres — okenn lòt chanjman nesesè.
//
// Diferans dyalèk yo (SQL) nou jere otomatikman isit:
//   - Plas paramèt: SQLite itilize "?", Postgres itilize "$1, $2..." —
//     nou konvèti "?" -> "$n" otomatikman pou Postgres.
//   - Rès SQL la (schema.sql) ekri nan yon sou-ansanm ki mache nan toude.
// =========================================================================
const path = require('path');
const fs = require('fs');

const url = process.env.DATABASE_URL || '';
const isPg = /^postgres(ql)?:\/\//i.test(url);

// Konvèti "?" placeholders an "$1, $2..." pou Postgres.
function toPgParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// PWOBLÈM POSTGRES: li transfòme non kolòn camelCase (createdAt) an miniskil
// (createdat) sof si yo site ak guillemet. Pou nou pa oblije chanje tout SQL
// nou an, nou kenbe yon lis tout non camelCase nou itilize, epi nou remape
// kle yo tounen apre chak "query" Postgres. Konsa rès kòd la rete menm jan.
const CAMEL_NAMES = [
  'createdAt', 'updatedAt', 'logoUrl', 'ownerId', 'imageUrl', 'storeId',
  'categoryId', 'userId', 'productId', 'unitPrice', 'productName', 'orderId',
  'moncashOrderId', 'transactionId', 'payerPhone', 'couponCode', 'shippingFee',
  'shippingZone', 'paymentMethod', 'minOrder', 'maxUses', 'usedCount',
  'expiresAt', 'customerId', 'conversationId', 'senderId', 'readAt',
  'storeName', 'storeSlug', 'categoryName', 'avgRating', 'reviewCount',
  'userName', 'customerName', 'lastMessage', 'wishlistId',
];
const LOWER_TO_CAMEL = Object.fromEntries(
  CAMEL_NAMES.map((c) => [c.toLowerCase(), c])
);

function remapRow(row) {
  if (!row) return row;
  const out = {};
  for (const key of Object.keys(row)) {
    out[LOWER_TO_CAMEL[key] || key] = row[key];
  }
  return out;
}

let impl;

if (isPg) {
  // ---------- PostgreSQL (pwodiksyon) ----------
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: url,
    // Render/Neon egzije SSL. rejectUnauthorized:false pou sètifika jere yo.
    ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false },
  });

  const run = async (sql, params = []) => {
    const res = await pool.query(toPgParams(sql), params);
    return { changes: res.rowCount };
  };
  const query = async (sql, params = []) => {
    const res = await pool.query(toPgParams(sql), params);
    return res.rows.map(remapRow);
  };
  const get = async (sql, params = []) => {
    const res = await pool.query(toPgParams(sql), params);
    return remapRow(res.rows[0]);
  };

  impl = {
    isPg: true,
    query,
    get,
    run,
    exec: async (sql) => {
      await pool.query(sql);
    },
    // Transaksyon: yon sèl koneksyon (client) pou BEGIN..COMMIT.
    tx: async (fn) => {
      const client = await pool.connect();
      const t = {
        run: async (sql, params = []) => {
          const r = await client.query(toPgParams(sql), params);
          return { changes: r.rowCount };
        },
        get: async (sql, params = []) => {
          const r = await client.query(toPgParams(sql), params);
          return remapRow(r.rows[0]);
        },
        query: async (sql, params = []) => {
          const r = await client.query(toPgParams(sql), params);
          return r.rows.map(remapRow);
        },
      };
      try {
        await client.query('BEGIN');
        const result = await fn(t);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
  };
} else {
  // ---------- SQLite (lokal / devlopman) ----------
  const { DatabaseSync } = require('node:sqlite');
  const DB_PATH = process.env.DATABASE_FILE || path.join(__dirname, '..', 'dev.db');
  const sqlite = new DatabaseSync(DB_PATH);
  sqlite.exec('PRAGMA foreign_keys = ON');

  // Nou anrobe apèl sync yo nan Promise pou API a rete menm jan ak Postgres.
  const run = async (sql, params = []) => {
    const r = sqlite.prepare(sql).run(...params);
    return { changes: r.changes };
  };
  const query = async (sql, params = []) => sqlite.prepare(sql).all(...params);
  const get = async (sql, params = []) => sqlite.prepare(sql).get(...params);

  impl = {
    isPg: false,
    query,
    get,
    run,
    exec: async (sql) => sqlite.exec(sql),
    // Transaksyon SQLite: BEGIN/COMMIT/ROLLBACK sou menm koneksyon an.
    tx: async (fn) => {
      const t = { run, get, query };
      sqlite.exec('BEGIN');
      try {
        const result = await fn(t);
        sqlite.exec('COMMIT');
        return result;
      } catch (err) {
        sqlite.exec('ROLLBACK');
        throw err;
      }
    },
  };
}

// Inisyalize schema a (kreye tab yo si yo pa la deja).
async function init() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  await impl.exec(schema);
}

module.exports = { ...impl, init };
