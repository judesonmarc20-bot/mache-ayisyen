const { v4: uuid } = require('uuid');
const db = require('../db');
const { slugify } = require('../utils/slugify');

// Sou-repons pou mwayèn zetwal ak kantite review. Nou itilize CAST(... AS REAL)
// ak CAST(... AS INTEGER) pou rezilta yo tounen kòm nonm (pa tèks) nan Postgres.
const RATING_SELECT = `
  COALESCE(CAST((SELECT AVG(rating) FROM reviews WHERE productId = p.id) AS REAL), 0) as avgRating,
  CAST((SELECT COUNT(*) FROM reviews WHERE productId = p.id) AS INTEGER) as reviewCount
`;

const Product = {
  async create({ name, description, price, imageUrl, stock, storeId, categoryId }) {
    const id = uuid();
    let slug = slugify(name);
    const exists = await db.get(`SELECT id FROM products WHERE storeId = ? AND slug = ?`, [
      storeId,
      slug,
    ]);
    if (exists) slug = `${slug}-${id.slice(0, 6)}`;

    await db.run(
      `INSERT INTO products (id, name, slug, description, price, imageUrl, stock, storeId, categoryId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description, price, imageUrl || null, stock || 0, storeId, categoryId || null]
    );
    return this.findById(id);
  },

  findById(id) {
    return db.get(
      `SELECT p.*, s.name as storeName, s.slug as storeSlug, c.name as categoryName,
              ${RATING_SELECT}
       FROM products p
       JOIN stores s ON s.id = p.storeId
       LEFT JOIN categories c ON c.id = p.categoryId
       WHERE p.id = ?`,
      [id]
    );
  },

  // Lis pwodwi ki disponib nan magazen an jeneral, ak filtè opsyonèl.
  list({ storeId, categoryId, search, activeOnly = true } = {}) {
    let sql = `
      SELECT p.*, s.name as storeName, s.slug as storeSlug, c.name as categoryName,
             ${RATING_SELECT}
      FROM products p
      JOIN stores s ON s.id = p.storeId
      LEFT JOIN categories c ON c.id = p.categoryId
      WHERE 1 = 1
    `;
    const params = [];
    if (activeOnly) sql += ` AND p.active = 1 AND s.active = 1`;
    if (storeId) {
      sql += ` AND p.storeId = ?`;
      params.push(storeId);
    }
    if (categoryId) {
      sql += ` AND p.categoryId = ?`;
      params.push(categoryId);
    }
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY p.createdAt DESC`;
    return db.query(sql, params);
  },

  async update(id, fields) {
    const current = await this.findById(id);
    if (!current) return null;
    const next = { ...current, ...fields };
    await db.run(
      `UPDATE products SET name = ?, description = ?, price = ?, imageUrl = ?, stock = ?, active = ?, categoryId = ?
       WHERE id = ?`,
      [
        next.name,
        next.description,
        next.price,
        next.imageUrl,
        next.stock,
        next.active ? 1 : 0,
        next.categoryId,
        id,
      ]
    );
    return this.findById(id);
  },

  async decrementStock(id, quantity) {
    await db.run(`UPDATE products SET stock = stock - ? WHERE id = ?`, [quantity, id]);
  },

  async delete(id) {
    await db.run(`DELETE FROM products WHERE id = ?`, [id]);
  },
};

module.exports = Product;
