const { v4: uuid } = require('uuid');
const db = require('../db');

const Cart = {
  getItems(userId) {
    return db.query(
      `SELECT ci.id, ci.quantity, p.id as productId, p.name, p.price, p.imageUrl, p.stock,
              p.storeId, s.name as storeName
       FROM cart_items ci
       JOIN products p ON p.id = ci.productId
       JOIN stores s ON s.id = p.storeId
       WHERE ci.userId = ?
       ORDER BY ci.id`,
      [userId]
    );
  },

  async addItem(userId, productId, quantity = 1) {
    const existing = await db.get(
      `SELECT * FROM cart_items WHERE userId = ? AND productId = ?`,
      [userId, productId]
    );
    if (existing) {
      await db.run(`UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`, [
        quantity,
        existing.id,
      ]);
    } else {
      await db.run(
        `INSERT INTO cart_items (id, quantity, userId, productId) VALUES (?, ?, ?, ?)`,
        [uuid(), quantity, userId, productId]
      );
    }
    return this.getItems(userId);
  },

  async updateQuantity(userId, itemId, quantity) {
    if (quantity <= 0) {
      await db.run(`DELETE FROM cart_items WHERE id = ? AND userId = ?`, [itemId, userId]);
    } else {
      await db.run(`UPDATE cart_items SET quantity = ? WHERE id = ? AND userId = ?`, [
        quantity,
        itemId,
        userId,
      ]);
    }
    return this.getItems(userId);
  },

  async removeItem(userId, itemId) {
    await db.run(`DELETE FROM cart_items WHERE id = ? AND userId = ?`, [itemId, userId]);
    return this.getItems(userId);
  },

  async clear(userId) {
    await db.run(`DELETE FROM cart_items WHERE userId = ?`, [userId]);
  },
};

module.exports = Cart;
