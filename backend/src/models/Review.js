// =========================================================================
// Review.js — Aksè baz done pou evalyasyon (reviews)
// =========================================================================
const { v4: uuid } = require('uuid');
const db = require('../db');

const Review = {
  // Verifye si yon itilizatè gen dwa bay review: li dwe gen omwen yon kòmand
  // PEYE (PAID/SHIPPED/DELIVERED) ki gen pwodwi sa a ladan.
  async canReview(userId, productId) {
    const row = await db.get(
      `SELECT CAST(COUNT(*) AS INTEGER) as n
       FROM orders o
       JOIN order_items oi ON oi.orderId = o.id
       WHERE o.userId = ?
         AND oi.productId = ?
         AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')`,
      [userId, productId]
    );
    return row.n > 0;
  },

  async hasReviewed(userId, productId) {
    const row = await db.get(
      `SELECT id FROM reviews WHERE userId = ? AND productId = ?`,
      [userId, productId]
    );
    return !!row;
  },

  async create({ userId, productId, rating, comment }) {
    const id = uuid();
    await db.run(
      `INSERT INTO reviews (id, productId, userId, rating, comment) VALUES (?, ?, ?, ?, ?)`,
      [id, productId, userId, rating, comment || null]
    );
    return this.findById(id);
  },

  findById(id) {
    return db.get(
      `SELECT r.*, u.name as userName
       FROM reviews r JOIN users u ON u.id = r.userId
       WHERE r.id = ?`,
      [id]
    );
  },

  listByProduct(productId) {
    return db.query(
      `SELECT r.*, u.name as userName
       FROM reviews r JOIN users u ON u.id = r.userId
       WHERE r.productId = ?
       ORDER BY r.createdAt DESC`,
      [productId]
    );
  },

  async summary(productId) {
    const row = await db.get(
      `SELECT CAST(COUNT(*) AS INTEGER) as count,
              COALESCE(CAST(AVG(rating) AS REAL), 0) as average
       FROM reviews WHERE productId = ?`,
      [productId]
    );
    return { count: row.count, average: Math.round(row.average * 10) / 10 };
  },
};

module.exports = Review;
