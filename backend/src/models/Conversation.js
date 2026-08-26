// =========================================================================
// Conversation.js — Chat ant kliyan ak magazen (vandè)
// =========================================================================
const { v4: uuid } = require('uuid');
const db = require('../db');

const Conversation = {
  async getOrCreate(customerId, storeId) {
    let conv = await db.get(
      `SELECT * FROM conversations WHERE customerId = ? AND storeId = ?`,
      [customerId, storeId]
    );
    if (!conv) {
      const id = uuid();
      await db.run(`INSERT INTO conversations (id, customerId, storeId) VALUES (?, ?, ?)`, [
        id,
        customerId,
        storeId,
      ]);
      conv = await this.findById(id);
    }
    return conv;
  },

  findById(id) {
    return db.get(`SELECT * FROM conversations WHERE id = ?`, [id]);
  },

  listForCustomer(customerId) {
    return db.query(
      `SELECT c.*, s.name as storeName, s.slug as storeSlug,
              (SELECT body FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
              CAST((SELECT COUNT(*) FROM messages WHERE conversationId = c.id AND senderId != ? AND readAt IS NULL) AS INTEGER) as unread
       FROM conversations c
       JOIN stores s ON s.id = c.storeId
       WHERE c.customerId = ?
       ORDER BY c.updatedAt DESC`,
      [customerId, customerId]
    );
  },

  listForStore(storeId, vendorUserId) {
    return db.query(
      `SELECT c.*, u.name as customerName,
              (SELECT body FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
              CAST((SELECT COUNT(*) FROM messages WHERE conversationId = c.id AND senderId != ? AND readAt IS NULL) AS INTEGER) as unread
       FROM conversations c
       JOIN users u ON u.id = c.customerId
       WHERE c.storeId = ?
       ORDER BY c.updatedAt DESC`,
      [vendorUserId, storeId]
    );
  },

  async touch(id) {
    await db.run(`UPDATE conversations SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
  },
};

const Message = {
  list(conversationId) {
    return db.query(
      `SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC`,
      [conversationId]
    );
  },

  async create({ conversationId, senderId, body }) {
    const id = uuid();
    await db.run(
      `INSERT INTO messages (id, conversationId, senderId, body) VALUES (?, ?, ?, ?)`,
      [id, conversationId, senderId, body]
    );
    await Conversation.touch(conversationId);
    return db.get(`SELECT * FROM messages WHERE id = ?`, [id]);
  },

  async markRead(conversationId, readerId) {
    await db.run(
      `UPDATE messages SET readAt = CURRENT_TIMESTAMP
       WHERE conversationId = ? AND senderId != ? AND readAt IS NULL`,
      [conversationId, readerId]
    );
  },
};

module.exports = { Conversation, Message };
