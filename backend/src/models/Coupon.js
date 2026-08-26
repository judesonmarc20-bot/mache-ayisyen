// =========================================================================
// Coupon.js — Aksè baz done + lojik validasyon koupon rabè
// =========================================================================
const { v4: uuid } = require('uuid');
const db = require('../db');

const Coupon = {
  async create({ code, type = 'PERCENT', value, minOrder = 0, maxUses, storeId, expiresAt }) {
    const id = uuid();
    await db.run(
      `INSERT INTO coupons (id, code, type, value, minOrder, maxUses, storeId, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code.toUpperCase().trim(),
        type,
        value,
        minOrder || 0,
        maxUses || null,
        storeId || null,
        expiresAt || null,
      ]
    );
    return this.findById(id);
  },

  findById(id) {
    return db.get(`SELECT * FROM coupons WHERE id = ?`, [id]);
  },

  findByCode(code) {
    return db.get(`SELECT * FROM coupons WHERE code = ?`, [code.toUpperCase().trim()]);
  },

  listAll() {
    return db.query(`SELECT * FROM coupons ORDER BY createdAt DESC`);
  },

  listByStore(storeId) {
    return db.query(`SELECT * FROM coupons WHERE storeId = ? ORDER BY createdAt DESC`, [storeId]);
  },

  async incrementUse(id) {
    await db.run(`UPDATE coupons SET usedCount = usedCount + 1 WHERE id = ?`, [id]);
  },

  async setActive(id, active) {
    await db.run(`UPDATE coupons SET active = ? WHERE id = ?`, [active ? 1 : 0, id]);
    return this.findById(id);
  },

  async delete(id) {
    await db.run(`DELETE FROM coupons WHERE id = ?`, [id]);
  },

  // Valide yon kòd koupon kont yon sou-total.
  async validate(code, subtotal) {
    const coupon = await this.findByCode(code);
    if (!coupon) return { valid: false, error: 'Kòd koupon an pa egziste.' };
    if (!coupon.active) return { valid: false, error: 'Koupon sa a pa aktif ankò.' };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, error: 'Koupon sa a ekspire.' };
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: 'Koupon sa a rive nan limit itilizasyon li.' };
    }
    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        error: `Kòmand lan dwe omwen ${coupon.minOrder} G pou itilize koupon sa a.`,
      };
    }

    let discount = coupon.type === 'PERCENT' ? (subtotal * coupon.value) / 100 : coupon.value;
    discount = Math.min(discount, subtotal);
    discount = Math.round(discount * 100) / 100;

    return { valid: true, discount, coupon };
  },
};

module.exports = Coupon;
