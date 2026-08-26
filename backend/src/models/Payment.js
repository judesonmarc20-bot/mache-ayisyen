// =========================================================================
// Payment.js — Aksè baz done pou tab "payments" (istwa tantativ peman MonCash)
// =========================================================================
const { v4: uuid } = require('uuid');
const db = require('../db');

const Payment = {
  async create({ orderId, moncashOrderId }) {
    const id = uuid();
    await db.run(
      `INSERT INTO payments (id, orderId, moncashOrderId, status) VALUES (?, ?, ?, 'PENDING')`,
      [id, orderId, moncashOrderId]
    );
    return this.findByMoncashOrderId(moncashOrderId);
  },

  findLatestByOrderId(orderId) {
    return db.get(
      `SELECT * FROM payments WHERE orderId = ? ORDER BY createdAt DESC LIMIT 1`,
      [orderId]
    );
  },

  findByMoncashOrderId(moncashOrderId) {
    return db.get(`SELECT * FROM payments WHERE moncashOrderId = ?`, [moncashOrderId]);
  },

  async markCompleted(moncashOrderId, { transactionId, payerPhone }) {
    await db.run(
      `UPDATE payments SET status = 'COMPLETED', transactionId = ?, payerPhone = ? WHERE moncashOrderId = ?`,
      [transactionId || null, payerPhone || null, moncashOrderId]
    );
  },

  async markFailed(moncashOrderId) {
    await db.run(`UPDATE payments SET status = 'FAILED' WHERE moncashOrderId = ?`, [
      moncashOrderId,
    ]);
  },
};

module.exports = Payment;
