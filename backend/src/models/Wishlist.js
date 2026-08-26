const { v4: uuid } = require('uuid');
const db = require('../db');

const Wishlist = {
  list(userId) {
    return db.query(
      `SELECT w.id as wishlistId, p.*, s.name as storeName, s.slug as storeSlug,
              COALESCE(CAST((SELECT AVG(rating) FROM reviews WHERE productId = p.id) AS REAL), 0) as avgRating,
              CAST((SELECT COUNT(*) FROM reviews WHERE productId = p.id) AS INTEGER) as reviewCount
       FROM wishlist_items w
       JOIN products p ON p.id = w.productId
       JOIN stores s ON s.id = p.storeId
       WHERE w.userId = ?
       ORDER BY w.createdAt DESC`,
      [userId]
    );
  },

  async productIds(userId) {
    const rows = await db.query(`SELECT productId FROM wishlist_items WHERE userId = ?`, [
      userId,
    ]);
    return rows.map((r) => r.productId);
  },

  async add(userId, productId) {
    const existing = await db.get(
      `SELECT id FROM wishlist_items WHERE userId = ? AND productId = ?`,
      [userId, productId]
    );
    if (!existing) {
      await db.run(`INSERT INTO wishlist_items (id, userId, productId) VALUES (?, ?, ?)`, [
        uuid(),
        userId,
        productId,
      ]);
    }
  },

  async remove(userId, productId) {
    await db.run(`DELETE FROM wishlist_items WHERE userId = ? AND productId = ?`, [
      userId,
      productId,
    ]);
  },
};

module.exports = Wishlist;
